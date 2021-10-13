export const gotoRoute = (path: string): void => {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new window.PopStateEvent('popstate'));
};
