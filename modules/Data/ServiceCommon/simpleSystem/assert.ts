
export type AssertEqual<T, Test> = T extends Test ? 'pass' : 'fail';