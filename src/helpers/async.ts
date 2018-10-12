export async function stay(milliseconds: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(function() {
      resolve();
    }, milliseconds);
  });
}
