const stripScripts = (html: string) =>
  html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

const stripEventHandlers = (html: string) =>
  html
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\{[^}]*\}/gi, "");

const stripJavascriptUrls = (html: string) =>
  html.replace(/javascript:/gi, "");

export const sanitizeHtml = (html: string) =>
  stripJavascriptUrls(stripEventHandlers(stripScripts(html)));
