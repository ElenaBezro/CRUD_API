import { IncomingMessage, ServerResponse } from "http";

type RequestHandler = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => Promise<void>;

type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE";

export type { HTTPMethod, RequestHandler };
