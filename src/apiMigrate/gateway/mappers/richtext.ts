import { Parser, Node as CMNode } from "commonmark";
import type {
	Document,
	DocumentNode,
	Paragraph,
	Heading,
	HeadingLevel,
	HeadingText,
	HorizontalRule,
	BlockQuote,
	BlockQuoteNode,
	CodeBlock,
	List,
	ListItem,
	ListChild,
	Table,
	TableHeaderRow,
	TableRow,
	TableCellText,
	ColumnAlignment,
	Media,
	Image,
	AnimatedImage,
	Video,
	ParagraphContentNode,
	TextNode,
	PlainText,
	Text,
	RawText,
	Link,
	RedditLink,
	SpoilerText,
	FormatRange,
	RichTextContent,
} from "./richtext_types";
import { FormattingFlag } from "./richtext_types";


const parser = new Parser();
/**
 * Converts a Markdown string into a RichTextContent object.
 */
export function markdownToRichText(markdown: string, mediaMetadata: Record<string, any> = {}): RichTextContent {
	const parsedAst = parser.parse(markdown);
	const mediaIds = new Set(Object.keys(mediaMetadata));

	const document = parseBlockNodes(parsedAst.firstChild, mediaIds);

	return { document };
}


function parseBlockNodes(node: CMNode | null, mediaIds: Set<string>): DocumentNode[] {
	const nodes: DocumentNode[] = [];
	let curr = node;

	while (curr) {
		switch (curr.type) {
			case "paragraph": {
				const inlineContent = parseInlineContent(curr);

				// If the paragraph is a single plain text node that is a preview.redd.it URL
				// (no whitespace), convert it to an image media node using the captured id.
				const previewRegex = /^https:\/\/preview\.redd\.it\/([A-Za-z0-9]+)\.[A-Za-z0-9]+(?:\?.*)?$/;

				if (inlineContent.length === 1 && inlineContent[0].e === "text") {
					const txt = (inlineContent[0] as any).t || "";
					const match = previewRegex.exec(txt.trim());
					if (match?.[1] && mediaIds.has(match[1])) {
						nodes.push({ e: "img", id: match[1] });
						break;
					}
				}

				// Standalone media (images, gifs, videos) in a paragraph are lifted to top-level DocumentNodes
				if (
					inlineContent.length === 1 &&
					// @ts-ignore
					(inlineContent[0].e === "img" || inlineContent[0].e === "gif" || inlineContent[0].e === "video")
				) {
					nodes.push(inlineContent[0] as Media);
				} else {
					nodes.push({ e: "par", c: inlineContent as ParagraphContentNode[] });
				}
				break;
			}

			case "heading": {
				const headingText = parseHeadingContent(curr);
				const level = Math.min(Math.max(curr.level || 1, 1), 6) as HeadingLevel;
				const headingNode: Heading = { e: "h", l: level, ...(headingText.length > 0 ? { c: headingText } : {}) };
				nodes.push(headingNode);
				break;
			}

			case "thematic_break": {
				nodes.push({ e: "hr" });
				break;
			}

			case "block_quote": {
				const children = parseBlockNodes(curr.firstChild) as BlockQuoteNode[];
				nodes.push({ e: "blockquote", c: children });
				break;
			}

			case "code_block": {
				const codeBlock: CodeBlock = {
					e: "code",
					c: [{ e: "raw", t: curr.literal || "" }],
					...(curr.info && curr.info.trim() ? { l: curr.info.trim() } : {}),
				};
				nodes.push(codeBlock);
				break;
			}

			case "list": {
				const items: ListItem[] = [];
				let itemNode = curr.firstChild;

				while (itemNode) {
					if (itemNode.type === "item") {
						const children = parseBlockNodes(itemNode.firstChild) as ListChild[];
						items.push({ e: "li", ...(children.length > 0 ? { c: children } : {}) });
					}
					itemNode = itemNode.next;
				}

				const listNode: List = { e: "list", o: curr.listType === "ordered", c: items };
				nodes.push(listNode);
				break;
			}

			case "table": {
				nodes.push(parseTableNode(curr));
				break;
			}

			default:
				// Skip unhandled block nodes or traverse children
				if (curr.firstChild) {
					nodes.push(...parseBlockNodes(curr.firstChild));
				}
				break;
		}

		curr = curr.next;
	}

	return nodes;
}

// -----------------------------------------------------------------------------
// Inline Parsing
// -----------------------------------------------------------------------------

function parseInlineContent(parent: CMNode): (ParagraphContentNode | TableCellText)[] {
	const results: (ParagraphContentNode | TableCellText)[] = [];
	let textBuffer = "";
	let ranges: FormatRange[] = [];
	let currentFlags = 0;

	function flushText() {
		if (!textBuffer) return;
		const textToProcess = textBuffer;
		const rangesToProcess = [...ranges];
		textBuffer = "";
		ranges = [];

		results.push(...processTextAndFormatting(textToProcess, rangesToProcess));
	}

	function addText(str: string) {
		if (!str) return;
		const start = textBuffer.length;
		const len = str.length;
		if (currentFlags > 0) {
			ranges.push([currentFlags, start, len]);
		}
		textBuffer += str;
	}

	function walkInline(node: CMNode | null) {
		let curr = node;
		while (curr) {
			switch (curr.type) {
				case "text":
					addText(curr.literal || "");
					break;

				case "softbreak":
					addText(" ");
					break;

				case "linebreak":
					flushText();
					results.push({ e: "br" });
					break;

				case "code": {
					const prevFlags = currentFlags;
					currentFlags |= FormattingFlag.monospace;
					addText(curr.literal || "");
					currentFlags = prevFlags;
					break;
				}

				case "emph": {
					const prevFlags = currentFlags;
					currentFlags |= FormattingFlag.italic;
					walkInline(curr.firstChild);
					currentFlags = prevFlags;
					break;
				}

				case "strong": {
					const prevFlags = currentFlags;
					currentFlags |= FormattingFlag.bold;
					walkInline(curr.firstChild);
					currentFlags = prevFlags;
					break;
				}

				case "strikethrough": {
					const prevFlags = currentFlags;
					currentFlags |= FormattingFlag.strikethrough;
					walkInline(curr.firstChild);
					currentFlags = prevFlags;
					break;
				}

				case "link": {
					flushText();
					results.push(createLinkNode(curr));
					break;
				}

				case "image": {
					flushText();
					results.push(createMediaNode(curr));
					break;
				}

				case "html_inline": {
					addText(curr.literal || "");
					break;
				}

				default:
					if (curr.firstChild) {
						walkInline(curr.firstChild);
					}
					break;
			}
			curr = curr.next;
		}
	}

	walkInline(parent.firstChild);
	flushText();

	return results;
}

// -----------------------------------------------------------------------------
// Media Node Conversion
// -----------------------------------------------------------------------------

function createMediaNode(node: CMNode): Media {
	// Extracts alt text from inline child text nodes
	let altText = "";
	let child = node.firstChild;
	while (child) {
		if (child.literal) altText += child.literal;
		child = child.next;
	}
	altText = altText.trim();

	// Element type is determined by alt text ('gif', 'video', or 'img')
	let elementType: "img" | "gif" | "video" = "img";
	const altLower = altText.toLowerCase();
	if (altLower === "gif") {
		elementType = "gif";
	} else if (altLower === "video") {
		elementType = "video";
	}

	const dest = node.destination || "";

	// Uses title if available; otherwise uses alt text if it isn't the type specifier
	let caption: string | undefined = undefined;
	if (node.title && node.title.trim()) {
		caption = node.title.trim();
	} else if (altText && !["img", "gif", "video"].includes(altLower)) {
		caption = altText;
	}

	const mediaNode: any = { e: elementType };
	mediaNode.id = decodeURIComponent(dest);

	if (caption) {
		mediaNode.c = caption;
	}

	return mediaNode as Media;
}

// -----------------------------------------------------------------------------
// Link & Reddit Link Parsing
// -----------------------------------------------------------------------------

function createLinkNode(node: CMNode): Link | RedditLink {
	const dest = node.destination || "";

	const redditLink = createRedditLinkFromToken(dest);
	if (redditLink) {
		return redditLink;
	}

	const innerNodes = parseInlineContent(node);
	let text = "";
	let ranges: FormatRange[] = [];

	for (const item of innerNodes) {
		if (item.e === "text") {
			const start = text.length;
			text += item.t;
			if (item.f) {
				for (const [flags, s, l] of item.f) {
					ranges.push([flags, start + s, l]);
				}
			}
		}
	}

	const mergedRanges = mergeRanges(ranges);

	const linkNode: Link = {
		e: "link",
		t: text,
		u: dest.startsWith("javascript:") ? "javascript:alert('XSS prevented')" : dest,
		...(mergedRanges.length > 0 ? { f: mergedRanges } : {}),
		...(node.title ? { a: node.title } : {}),
	};

	return linkNode;
}

function createRedditLinkFromToken(token: string): RedditLink | null {
	// Subreddit: /r/sub or r/sub
	const subMatch = /^(\/)?r\/([a-zA-Z0-9_]+)$/i.exec(token);
	if (subMatch) {
		return { e: "r/", t: subMatch[2], l: Boolean(subMatch[1]) };
	}

	// User: /u/user or u/user
	const userMatch = /^(\/)?u\/([a-zA-Z0-9_-]+)$/i.exec(token);
	if (userMatch) {
		return { e: "u/", t: userMatch[2], l: Boolean(userMatch[1]) };
	}

	// Mention: @user
	const mentionMatch = /^@([a-zA-Z0-9_-]+)$/i.exec(token);
	if (mentionMatch) {
		return { e: "@", t: mentionMatch[1], l: false };
	}

	// Comment: c/id or /c/id
	const commentMatch = /^(\/)?c\/([a-zA-Z0-9_]+)$/i.exec(token);
	if (commentMatch) {
		return { e: "c/", t: commentMatch[2] };
	}

	// Post: p/id or /p/id
	const postMatch = /^(\/)?p\/([a-zA-Z0-9_]+)$/i.exec(token);
	if (postMatch) {
		return { e: "p/", t: postMatch[2] };
	}

	return null;
}

// -----------------------------------------------------------------------------
// Text, Format Ranges, and Spoiler Processing
// -----------------------------------------------------------------------------

function processTextAndFormatting(text: string, ranges: FormatRange[]): TextNode[] {
	// Check for inline spoiler tags >! ... !<
	const spoilerRegex = />!([\s\S]*?)!</g;
	if (spoilerRegex.test(text)) {
		spoilerRegex.lastIndex = 0;
		const nodes: TextNode[] = [];
		let lastIdx = 0;
		let match: RegExpExecArray | null;

		while ((match = spoilerRegex.exec(text)) !== null) {
			const matchStart = match.index;
			const matchEnd = spoilerRegex.lastIndex;
			const innerText = match[1];

			if (matchStart > lastIdx) {
				const subStr = text.slice(lastIdx, matchStart);
				const subRanges = sliceRanges(ranges, lastIdx, subStr.length);
				nodes.push(...parseRedditLinksFromText(subStr, subRanges));
			}

			const innerStart = matchStart + 2;
			const innerRanges = sliceRanges(ranges, innerStart, innerText.length);
			const innerNodes = parseRedditLinksFromText(innerText, innerRanges);

			nodes.push({ e: "spoilertext", c: innerNodes });
			lastIdx = matchEnd;
		}

		if (lastIdx < text.length) {
			const subStr = text.slice(lastIdx);
			const subRanges = sliceRanges(ranges, lastIdx, subStr.length);
			nodes.push(...parseRedditLinksFromText(subStr, subRanges));
		}

		return nodes;
	}

	return parseRedditLinksFromText(text, ranges);
}

function parseRedditLinksFromText(text: string, ranges: FormatRange[]): PlainText[] {
	const redditRegex = /(?:^|\s)(\/?[ru]\/[a-zA-Z0-9_-]+|@[a-zA-Z0-9_-]+|\/?[cp]\/[a-zA-Z0-9_]+)(?=\s|$|[.,!?:;])/g;
	const nodes: PlainText[] = [];
	let lastIdx = 0;
	let match: RegExpExecArray | null;

	while ((match = redditRegex.exec(text)) !== null) {
		const fullMatch = match[0];
		const token = match[1];
		const tokenStart = match.index + (fullMatch.length - token.length);
		const tokenEnd = tokenStart + token.length;

		if (tokenStart > lastIdx) {
			const subStr = text.slice(lastIdx, tokenStart);
			const subRanges = sliceRanges(ranges, lastIdx, subStr.length);
			nodes.push(createTextNode(subStr, subRanges));
		}

		const redditLink = createRedditLinkFromToken(token);
		if (redditLink) {
			nodes.push(redditLink);
		} else {
			const subRanges = sliceRanges(ranges, tokenStart, token.length);
			nodes.push(createTextNode(token, subRanges));
		}

		lastIdx = tokenEnd;
	}

	if (lastIdx < text.length) {
		const subStr = text.slice(lastIdx);
		const subRanges = sliceRanges(ranges, lastIdx, subStr.length);
		nodes.push(createTextNode(subStr, subRanges));
	}

	return nodes;
}

function createTextNode(t: string, ranges: FormatRange[]): Text {
	const merged = mergeRanges(ranges);
	return { e: "text", t, ...(merged.length > 0 ? { f: merged } : {}) };
}

function sliceRanges(ranges: FormatRange[], subStart: number, subLen: number): FormatRange[] {
	const result: FormatRange[] = [];
	const subEnd = subStart + subLen;
	for (const [flags, start, len] of ranges) {
		const rangeEnd = start + len;
		const overlapStart = Math.max(start, subStart);
		const overlapEnd = Math.min(rangeEnd, subEnd);
		if (overlapStart < overlapEnd) {
			result.push([flags, overlapStart - subStart, overlapEnd - overlapStart]);
		}
	}
	return mergeRanges(result);
}

function mergeRanges(ranges: FormatRange[]): FormatRange[] {
	if (ranges.length <= 1) return ranges;
	const merged: FormatRange[] = [];
	let current = [...ranges[0]] as FormatRange;

	for (let i = 1; i < ranges.length; i++) {
		const next = ranges[i];
		if (current[0] === next[0] && current[1] + current[2] === next[1]) {
			current[2] += next[2];
		} else {
			merged.push(current);
			current = [...next] as FormatRange;
		}
	}
	merged.push(current);
	return merged;
}

// -----------------------------------------------------------------------------
// Heading & Table Helpers
// -----------------------------------------------------------------------------

function parseHeadingContent(headingNode: CMNode): HeadingText[] {
	const result: HeadingText[] = [];
	let currentRaw = "";

	function flushRaw() {
		if (currentRaw) {
			result.push({ e: "raw", t: currentRaw });
			currentRaw = "";
		}
	}

	let child = headingNode.firstChild;
	while (child) {
		if (child.type === "link") {
			flushRaw();
			result.push(createLinkNode(child));
		} else if (child.type === "text" || child.type === "code") {
			currentRaw += child.literal || "";
		} else if (child.type === "softbreak" || child.type === "linebreak") {
			currentRaw += " ";
		} else {
			currentRaw += getNodeLiteralText(child);
		}
		child = child.next;
	}
	flushRaw();

	// Merge consecutive RawText nodes
	const merged: HeadingText[] = [];
	for (const item of result) {
		if (item.e === "raw") {
			if (merged.length > 0 && merged[merged.length - 1].e === "raw") {
				(merged[merged.length - 1] as RawText).t += item.t;
			} else {
				merged.push(item);
			}
		} else {
			merged.push(item);
		}
	}

	return merged;
}

function getNodeLiteralText(node: CMNode): string {
	let text = node.literal || "";
	let child = node.firstChild;
	while (child) {
		text += getNodeLiteralText(child);
		child = child.next;
	}
	return text;
}

function parseTableNode(tableNode: CMNode): Table {
	const headerRow: TableHeaderRow = [];
	const bodyRows: TableRow[] = [];

	let rowNode = tableNode.firstChild;
	let isHeader = true;

	while (rowNode) {
		if (rowNode.type === "table_header" || (rowNode.type === "table_row" && isHeader)) {
			let cellNode = rowNode.firstChild;
			while (cellNode) {
				const alignChar = mapAlign((cellNode as any).align);
				const content = parseInlineContent(cellNode) as TableCellText[];
				headerRow.push({ ...(alignChar ? { a: alignChar } : {}), ...(content.length > 0 ? { c: content } : {}) });
				cellNode = cellNode.next;
			}
			isHeader = false;
		} else if (rowNode.type === "table_row") {
			const rowCells: TableRow = [];
			let cellNode = rowNode.firstChild;
			while (cellNode) {
				const content = parseInlineContent(cellNode) as TableCellText[];
				rowCells.push({ ...(content.length > 0 ? { c: content } : {}) });
				cellNode = cellNode.next;
			}
			bodyRows.push(rowCells);
		}
		rowNode = rowNode.next;
	}

	return { e: "table", h: headerRow, c: bodyRows };
}

function mapAlign(align?: string): ColumnAlignment | undefined {
	if (!align) return undefined;
	const lower = align.toLowerCase();
	if (lower === "left" || lower === "l") return "L";
	if (lower === "right" || lower === "r") return "R";
	if (lower === "center" || lower === "c") return "C";
	return undefined;
}
