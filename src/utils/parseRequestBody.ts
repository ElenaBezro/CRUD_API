import { IncomingMessage } from "http";

const parseRequestBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    const body: Buffer[] = [];

    req.on("data", (chunk) => body.push(chunk));

    req.on("end", () => {
      try {
        resolve(Buffer.concat(body).toString());
      } catch (error: unknown) {
        reject(error);
      }
    });
  });

export { parseRequestBody };
