import type { RichTextContent } from "../../apiMigrate/gateway/types/richtext";

type TextNodeLike = {
    e?: string;
    t?: unknown;
    c?: unknown;
    h?: unknown;
    a?: unknown;
};

function extractNodeText(value: unknown): string {
    if (Array.isArray(value)) {
        return value.map(extractNodeText).join("");
    }
    if (value === null || typeof value !== "object") {
        return "";
    }

    const node = value as TextNodeLike;

    if (node.e === "br" || node.e === "hr") {
        return "\n";
    }

    if (node.e === "table") {
        const rows = [node.h, node.c].flatMap(rows =>
            Array.isArray(rows) ? rows : [],
        );
        return rows
            .map(row =>
                Array.isArray(row)
                    ? row.map(extractNodeText).join(" ")
                    : extractNodeText(row),
            )
            .join("\n");
    }

    const text = typeof node.t === "string" ? node.t : "";
    const children = Array.isArray(node.c)
        ? node.c.map(extractNodeText).join(
                node.e === "list" || node.e === "blockquote" ? "\n" : "",
            )
        : (node.e === "img" || node.e === "gif" || node.e === "video") &&
                typeof node.c === "string"
            ? node.c
            : "";

    return `${text}${children}${extractNodeText(node.a)}`;
}

export default function richtextToText(content: RichTextContent): string {
    return content.document.map(extractNodeText).join("\n");
}