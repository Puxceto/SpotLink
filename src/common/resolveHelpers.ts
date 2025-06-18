export async function waitForYouTubeComments(
  commentId: string,
  timeoutMs = 3000
): Promise<HTMLElement | null> {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      const el = document.getElementById(commentId) as HTMLElement | null;
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
}

export async function waitForInfiniteScroll(
  selector: string,
  textSnippet: string,
  timeoutMs = 3000
): Promise<HTMLElement | null> {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
      const match = els.find((el) =>
        el.textContent?.includes(textSnippet)
      );
      if (match) {
        resolve(match);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }
      window.scrollBy(0, window.innerHeight);
      setTimeout(check, 200);
    };
    check();
  });
}
