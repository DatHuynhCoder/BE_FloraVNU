export const trimHTMLTags = (html: string) => {
  return html.replace(/<[^>]*>/g, '').trim();
}