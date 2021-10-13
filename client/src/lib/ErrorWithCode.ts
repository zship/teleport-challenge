export type ErrorCode = 'api/unexpectedResponse';

class ErrorWithCode extends Error {
  code: ErrorCode;

  constructor({ code, message }: { code: ErrorCode; message?: string }) {
    // 'Error' breaks prototype chain here
    super(message);
    // restore prototype chain
    const actualProto = new.target.prototype;
    Object.setPrototypeOf(this, actualProto);

    this.code = code;
  }
}

export { ErrorWithCode };
