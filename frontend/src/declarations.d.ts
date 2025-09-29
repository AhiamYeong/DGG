/**
 * @format
 * @summary TypeScript가 PNG 파일을 import할 수 있도록 타입을 알려주는 역할
 */

declare module "*.png" {
  const value: string;
  export default value;
}
