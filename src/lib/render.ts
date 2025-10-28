type HtmlValue =
  | Node
  | string
  | number
  | boolean
  | null
  | undefined
  | HtmlValue[];

function toNodeArray(value: HtmlValue): Node[] {
  if (value == null || value === false) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => toNodeArray(item));
  }

  if (value instanceof Node) {
    return [value];
  }

  return [document.createTextNode(String(value))];
}

function attributeValueToString(value: HtmlValue): string | null {
  if (value == null || value === false) {
    return null;
  }

  if (value === true) {
    return "";
  }

  if (Array.isArray(value)) {
    const parts: string[] = [];
    for (const part of value) {
      const str = attributeValueToString(part);
      if (str == null) {
        continue;
      }
      if (str.length > 0) {
        parts.push(str);
      }
    }
    return parts.join(" ");
  }

  if (value instanceof Node) {
    return value.textContent ?? "";
  }

  return String(value);
}

const COMMENT_PREFIX = "__html_slot_";
const COMMENT_REGEX = new RegExp(`<!--${COMMENT_PREFIX}(\\d+)-->`, "g");

export function html(
  strings: TemplateStringsArray,
  ...values: HtmlValue[]
): DocumentFragment {
  const template = document.createElement("template");

  const htmlString = strings.reduce((acc, current, index) => {
    if (index === values.length) {
      return acc + current;
    }
    const marker = `<!--__html_slot_${index}-->`;
    return acc + current + marker;
  }, "");

  template.innerHTML = htmlString;
  const fragment = template.content;

  if (!values.length) {
    return fragment;
  }

  const consumedInAttributes = new Set<number>();

  const elementWalker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  while (elementWalker.nextNode()) {
    const element = elementWalker.currentNode as Element;
    const attributes = Array.from(element.attributes);
    for (const attr of attributes) {
      const rawValue = attr.value;
      if (!rawValue.includes(COMMENT_PREFIX)) {
        continue;
      }

      COMMENT_REGEX.lastIndex = 0;
      let match: RegExpExecArray | null;
      let lastIndex = 0;
      let hasStatic = false;
      let finalValue = "";
      let removeAttribute = true;

      while ((match = COMMENT_REGEX.exec(rawValue))) {
        const staticChunk = rawValue.slice(lastIndex, match.index);
        if (staticChunk.length > 0) {
          finalValue += staticChunk;
          hasStatic = true;
        }

        const idx = Number(match[1]);
        consumedInAttributes.add(idx);
        const replacement = attributeValueToString(values[idx]);
        if (replacement != null) {
          if (replacement.length > 0) {
            finalValue += replacement;
          }
          removeAttribute = false;
        }

        lastIndex = match.index + match[0].length;
      }

      const trailing = rawValue.slice(lastIndex);
      if (trailing.length > 0) {
        finalValue += trailing;
        hasStatic = true;
      }

      if ((!hasStatic && removeAttribute) || finalValue.length === 0) {
        element.removeAttribute(attr.name);
      } else {
        element.setAttribute(attr.name, finalValue);
      }
    }
  }

  const walker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_COMMENT,
    null
  );

  const commentNodes: Comment[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Comment;
    const data = node?.nodeValue || "";
    if (data.startsWith(COMMENT_PREFIX)) {
      commentNodes.push(node);
    }
  }

  for (const commentNode of commentNodes) {
    const data = commentNode.nodeValue || "";
    const idx = Number(data.slice(COMMENT_PREFIX.length));
    if (Number.isNaN(idx) || idx >= values.length) {
      commentNode.parentNode?.removeChild(commentNode);
      continue;
    }

    if (consumedInAttributes.has(idx)) {
      commentNode.parentNode?.removeChild(commentNode);
      continue;
    }

    const nodes = toNodeArray(values[idx]);
    const parent = commentNode.parentNode;
    if (!parent) continue;

    if (!nodes.length) {
      parent.removeChild(commentNode);
      continue;
    }

    for (const node of nodes) {
      parent.insertBefore(node, commentNode);
    }
    parent.removeChild(commentNode);
  }

  return fragment;
}

export default html;
