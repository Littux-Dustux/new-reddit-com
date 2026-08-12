export type UrlString = string;
export type FormattingSpecification = number;
export enum FormattingFlag {
	bold = 1,
	italic = 2,
	underline = 4,
	strikethrough = 8,
	subscript = 16,
	superscript = 32,
	monospace = 64,
}
export type FormatRange = [FormattingSpecification, number, number];
export declare const TEXT_ELEMENT = "text";
export type Text = { e: typeof TEXT_ELEMENT; t: string; f?: FormatRange[] };
export declare const RAW_TEXT_ELEMENT = "raw";
export type RawText = { e: typeof RAW_TEXT_ELEMENT; t: string };
export declare const LINEBREAK_ELEMENT = "br";
export type LineBreak = { e: typeof LINEBREAK_ELEMENT };
export declare const LINK_ELEMENT = "link";
export type Link = { e: typeof LINK_ELEMENT; t: string; u: UrlString; f?: FormatRange[]; a?: string };
export declare const COMMENT_LINK_ELEMENT = "c/";
export type CommentLink = { e: typeof COMMENT_LINK_ELEMENT; t: string };
export declare const POST_LINK_ELEMENT = "p/";
export type PostLink = { e: typeof POST_LINK_ELEMENT; t: string };
export declare const SUBREDDIT_LINK_ELEMENT = "r/";
export type SubredditLink = { e: typeof SUBREDDIT_LINK_ELEMENT; t: string; l: boolean };
export declare const USER_LINK_ELEMENT = "u/";
export type UserLink = { e: typeof USER_LINK_ELEMENT; t: string; l: boolean };
export declare const USER_MENTION_ELEMENT = "@";
export type UserMention = { e: typeof USER_MENTION_ELEMENT; t: string; l: boolean };
export type RedditLink = CommentLink | PostLink | SubredditLink | UserLink | UserMention;
export type PlainText = Text | Link | RedditLink | LineBreak;
export declare const SPOILER_TEXT_ELEMENT = "spoilertext";
export type SpoilerText = { e: typeof SPOILER_TEXT_ELEMENT; c: PlainText[] };
export type TextNode = PlainText | SpoilerText;
export declare const PARAGRAPH_ELEMENT = "par";
export type ParagraphContentNode = TextNode | Image | AnimatedImage;
export type Paragraph = { e: typeof PARAGRAPH_ELEMENT; c: ParagraphContentNode[] };
export type HeadingText = RawText | Link | RedditLink;
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export declare const HEADING_ELEMENT = "h";
export type Heading = { e: typeof HEADING_ELEMENT; l: HeadingLevel; c?: HeadingText[] };
export declare const HORIZONTAL_RULE_ELEMENT = "hr";
export type HorizontalRule = { e: typeof HORIZONTAL_RULE_ELEMENT };
export type BlockQuoteNode = BlockQuote | CodeBlock | Heading | List | Paragraph | Table;
export declare const BLOCK_QUOTE_ELEMENT = "blockquote";
export type BlockQuote = { e: typeof BLOCK_QUOTE_ELEMENT; c: BlockQuoteNode[]; a?: TextNode };
export declare const CODE_BLOCK_ELEMENT = "code";
export type CodeBlock = { e: typeof CODE_BLOCK_ELEMENT; c: RawText[]; l?: string };
export declare const LIST_ITEM_ELEMENT = "li";
export type ListChild = BlockQuote | CodeBlock | Heading | HorizontalRule | List | Paragraph | Table;
export type ListItem = { e: typeof LIST_ITEM_ELEMENT; c?: ListChild[] };
export declare const LIST_ELEMENT = "list";
/**
 * Note: the spec is somewhat ambiguous here, consider that
 * as typed, there are multiple possible representations of
 * a list of two, top-level, paragraphs.
 *
 * e.g.
 * The CommonMark list of:
 * ```
 *  * foo
 *  * bar
 * ```
 *
 * could either be represented as
 * (List
 *    (ListChild
 *       (Paragraph 'foo')
 *       (Paragraph 'bar' )))
 *
 * OR
 *
 * (List
 *    (ListChild
 *        (Paragraph 'foo' ))
 *    (ListChild
 *        (Paragraph 'bar)))
 *
 * The spec is designed to be interoperable with our CommonMark parser, and as so,
 * the preferred encoding is the latter.
 *
 * If you would like to demo  CommonMark Markdown -> AST conversions,
 * you can try out http://spec.commonmark.org/dingus/
 */
export type List = { e: typeof LIST_ELEMENT; o: boolean; c: ListItem[] };
export type TableCellText = Text | Link | RedditLink | SpoilerText | Image | AnimatedImage;
export type TableCell = { c?: TableCellText[] };
export declare const COLUMN_ALIGN_LEFT = "L";
export declare const COLUMN_ALIGN_RIGHT = "R";
export declare const COLUMN_ALIGN_CENTER = "C";
export type ColumnAlignment = typeof COLUMN_ALIGN_LEFT | typeof COLUMN_ALIGN_RIGHT | typeof COLUMN_ALIGN_CENTER;
export type TableHeaderCell = { a?: ColumnAlignment; c?: TableCellText[] };
export type TableHeaderRow = TableHeaderCell[];
export type TableRow = TableCell[];
export declare const TABLE_ELEMENT = "table";
export type Table = { e: typeof TABLE_ELEMENT; h: TableHeaderRow; c: TableRow[] };
export declare const EMBED_ELEMENT = "embed";
export type Embed = { e: typeof EMBED_ELEMENT; u: UrlString; c: UrlString; x: number; y: number };
export type MediaAssetId = string;
export type ObfuscationReason = "nsfw" | "spoiler";
export declare const IMAGE_ELEMENT = "img";
export type Image = {
	e: typeof IMAGE_ELEMENT;
	/** URL of the media when building; backend may replace with id in processed JSON */
	mediaUrl?: string;
	id?: MediaAssetId;
	c?: string;
	o?: ObfuscationReason;
};
export declare const ANIMATED_IMAGE_ELEMENT = "gif";
export type AnimatedImage = {
	e: typeof ANIMATED_IMAGE_ELEMENT;
	/** URL of the media when building; backend may replace with id in processed JSON */
	mediaUrl?: string;
	id?: MediaAssetId;
	c?: string;
	o?: ObfuscationReason;
};
export declare const VIDEO_ELEMENT = "video";
export type Video = {
	e: typeof VIDEO_ELEMENT;
	/** URL of the media when building; backend may replace with id in processed JSON */
	mediaUrl?: string;
	id?: MediaAssetId;
	c?: string;
	o?: ObfuscationReason;
	p?: Image;
	gifify?: boolean;
};
export type Media = Image | AnimatedImage | Video;
export type DocumentNode = Paragraph | Heading | HorizontalRule | BlockQuote | CodeBlock | Embed | List | Table | Media;
export type Document = DocumentNode[];
export type RichTextContent = { document: Document };