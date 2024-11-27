import { LogReturn, Logs } from "@ubiquity-os/ubiquity-os-logger";
import { addCommentToIssue, addCommentToPullRequestReview } from "../handlers/add-comment";
import { Context } from "../types";

export const logger = new Logs("debug");

export function sanitizeMetadata(obj: LogReturn["metadata"]): string {
  return JSON.stringify(obj, null, 2).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/--/g, "&#45;&#45;");
}

export async function bubbleUpErrorComment(context: Context, err: unknown, post = true): Promise<LogReturn> {
  let errorMessage;
  if (err instanceof LogReturn) {
    errorMessage = err;
  } else if (err instanceof Error) {
    errorMessage = context.logger.error(err.message, { stack: err.stack });
  } else {
    errorMessage = context.logger.error("An error occurred", { err });
  }

  if (post) {
    if (context.eventName === "issue_comment.created") {
      await addCommentToIssue(context, `${errorMessage?.logMessage.diff}\n<!--\n${sanitizeMetadata(errorMessage?.metadata)}\n-->`);
    } else {
      await addCommentToPullRequestReview(context, `${errorMessage?.logMessage.diff}\n<!--\n${sanitizeMetadata(errorMessage?.metadata)}\n-->`);
    }
  }

  return errorMessage;
}
