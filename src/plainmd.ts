import * as fs from 'fs';
import { EOL } from 'os';
import * as path from 'path';

function convertTitle(md: string): string {
  return md.replace(/^#\s+(.*)/gm, (match, title: string) => {
    return title.toLocaleUpperCase() + EOL + Array(title.length + 1).join('=');
  });
}

function convertHeadings(md: string): string {
  return md.replace(/^(#+)\s+(.*)/gm, (match, level, content: string) => {
    return `${EOL}${content.toLocaleUpperCase()}`;
  });
}

function convertAdmonitions(md: string): string {
  return md.replace(/^!!!\s(.*)\n\s+/gm, (match, content: string) => {
    return content.toLocaleUpperCase() + EOL + EOL;
  });
}

function includeContent(md: string, rootFolder: string): string {
  return md.replace(/^--8<-- "([^"]+)"/gm, (match, filePath: string) => {
    return fs.readFileSync(path.join(rootFolder, filePath), 'utf8');
  });
}

function convertDd(md: string): string {
  return md.replace(/^:\s(.*)/gm, (match, content: string) => {
    return `  ${content}`;
  });
}

function convertHyperlinks(md: string): string {
  return md.replace(/\[(.*)\]\((.*)\)/gm, (match, label: string, url: string) => {
    // if the link is the same as the content, return just the link
    if (label === url) {
      return url;
    }

    // if the link is relative, remove it because there's no way to open it
    // from the terminal anyway. In the future, we could convert it to the
    // actual link of the docs.
    if (!url.startsWith('http:') && !url.startsWith('https:')) {
      return label;
    }

    return `${label} (${url})`;
  });
}

function convertCodeFences(md: string): string {
  return md.replace(/^```.*?\n(.*?)```\n/gms, (match, code: string) => {
    return `  ${code}${EOL}`;
  });
}

function removeInlineMarkup(md: string): string {
  // from https://stackoverflow.com/a/70064453
  return md.replace(/(?<marks>[`]|\*{1,3}|_{1,3}|~{2})(?<inmarks>.*?)\1/g, '$<inmarks>$<link_text>');
}

function removeTooManyEmptyLines(md: string): string {
  return md.replace(/\n{4,}/g, Array(4).join(EOL));
}

const convertFunctions = [
  convertTitle,
  convertHeadings,
  convertAdmonitions,
  convertDd,
  convertHyperlinks,
  convertCodeFences,
  removeInlineMarkup,
  removeTooManyEmptyLines
];

export const plainmd = {
  md2plain(md: string, rootFolder: string) {
    md = includeContent(md, rootFolder);
    convertFunctions.forEach(convert => {
      md = convert(md);
    });

    return md;
  }
};