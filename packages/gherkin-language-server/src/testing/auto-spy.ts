// https://indepth.dev/create-your-angular-unit-test-spies-automagically/

export type SpyOf<T> = T & { [k in keyof T]: T[k] extends (...args: any[]) => infer R ? jest.Mock<R> : T[k] };

export function autoSpy<T>(obj: new (...args: any[]) => T): SpyOf<T> {
  const result: SpyOf<T> = {} as any;
  const keys = Object.getOwnPropertyNames(obj.prototype);
  keys.forEach((key) => (result[key] = jest.fn().mockName(key)));
  return result;
}
