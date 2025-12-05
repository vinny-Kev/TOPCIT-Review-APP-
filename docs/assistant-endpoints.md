# AI Assistant Endpoint Blueprint

The UI now exposes a floating chatbot button, PDF uploads, and custom content builders. To fully wire these up you will need the following API surface area. All routes should require the same JWT auth already used elsewhere.

## 1. Conversational guidance

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/assistant/messages` | Accepts `{ message: string, context?: { documentId?: number } }`. Returns `{ reply: string, suggestions?: string[] }`. The UI queues responses and shows a "Thinking" indicator while waiting. |
| `GET` | `/api/assistant/history` | Returns a short transcript so the chat bubble can reload previous exchanges when the user refreshes. |

### Notes
- The frontend currently stubs the response. Once this endpoint exists, replace the placeholder promise inside `ChatAssistant` with an axios call.
- Include streaming support (SSE or WebSocket) if you want to keep the UI responsive while longer replies are generated.

## 2. Document ingestion + parsing

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/documents/upload` | Already implemented. Stores PDFs and marks status=`PENDING`. |
| `POST` | `/api/documents/:id/process` | Triggers Ollama to parse the stored PDF, returning `{ summary, flashcards: FlashcardInput[], examQuestions: ExamQuestionInput[] }` and updating status to `PROCESSED`/`FAILED`. |
| `GET` | `/api/documents/:id/result` | Optional endpoint if processing is asynchronous; returns extraction progress & payload. |

The dashboard expects the assistant to eventually push generated flashcards/exam questions through the existing `POST /api/custom-content/flashcards` and `/api/custom-content/exams` endpoints.

## 3. Automation hooks

| Method | Route | Details |
| --- | --- | --- |
| `POST` | `/api/assistant/flashcards` | Accepts `{ sourceDocumentId?: number, flashcards: [{ prompt, answer, tags? }] }` to bulk insert output created by the model. |
| `POST` | `/api/assistant/exams` | Accepts `{ sourceDocumentId?: number, questions: [{ question, sampleAnswer?, difficulty? }] }`. |

These helpers prevent the client from uploading dozens of entries one-by-one when the AI produces new material.

## 4. Security considerations
- All endpoints must verify ownership of `documentId` so one user cannot read another user’s uploads.
- Large language model payloads can be big; set sane limits (e.g., 50 flashcards per call) and stream to storage if necessary.
- Propagate `status` updates back through `/api/documents` so the dashboard accurately reflects when parsing completes.

## 5. Future enhancements
- Webhook or background worker to mark documents as `PROCESSED` without the client polling.
- SSE channel (`/api/assistant/stream`) so the chat widget can render streaming tokens.
- `DELETE /api/assistant/history` to let users reset conversations.
