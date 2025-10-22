/* eslint-disable @typescript-eslint/no-explicit-any */
import { GridApi } from "ag-grid-community";
import { useChat, useTool } from "@hashbrownai/react";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import styles from "./NLQuery.module.css";

export function NLQuery({
  schema,
  gridApi,
}: {
  schema: any;
  gridApi: GridApi;
}) {
  const [inputValue, setInputValue] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const isReady = useMemo(() => Boolean(schema && gridApi), [schema, gridApi]);

  const updateGridState = useTool({
    name: "updateGridState",
    description: "Update the grid state",
    schema,
    deps: [schema, gridApi],
    handler: async (result) => {
      if (!gridApi) {
        return;
      }

      try {
        gridApi.setState(result);
      } catch (error) {
        console.error("Failed to apply grid state", error);
      }
    },
  });

  const {
    messages,
    sendMessage,
    isReceiving,
    isSending,
    isRunningToolCalls,
    error,
    reload,
    stop,
  } = useChat({
    model: "gpt-5",
    tools: [updateGridState],
    system: `
      You are an expert data analyst working with a data grid. 

      You should respond to user requests by calling the "updateGridState" tool
      with their requested changes to the grid state. The call should include 
      all their requested changes, along with any features that are already 
      applied to the grid that they have not requested to change.

      The grid has the following features available to manipulate:
      - Column Visibility
      - Column Sizing
      - Row Grouping
      - Sorting
      - Aggregation
      - Pivoting
      - Filtering

      # Response Guidelines
       - Respond to the user's request in a friendly and helpful manner.
       - If the user's request is not clear, ask for clarification.
       - If the user's request is not possible, explain why and suggest an alternative.
       - If the user's request is possible, call the "updateGridState" tool to update the grid state.
    `,
  });

  const onCommit = useCallback(
    (value: string) => {
      setInputValue("");
      sendMessage({
        role: "user",
        content: value,
      });
    },
    [sendMessage]
  );

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      if (event) {
        event.preventDefault();
      }

      const trimmed = inputValue.trim();
      if (!trimmed || isSending || !isReady) {
        return;
      }

      onCommit(trimmed);
    },
    [inputValue, isReady, isSending, onCommit]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isReceiving]);

  const renderContent = useCallback((content: unknown) => {
    if (typeof content === "string") {
      return content;
    }

    if (!content) {
      return "";
    }

    try {
      return JSON.stringify(content, null, 2);
    } catch (error) {
      console.error("Unable to render message content", error);
      return String(content);
    }
  }, []);

  const isBusy = isSending || isReceiving || isRunningToolCalls;

  return (
    <div className={styles.chat}>
      <header className={styles.header}>
        <div>
          <p className={styles.subtitle}>Natural language controls</p>
          <h2 className={styles.title}>AI Grid Assistant</h2>
        </div>
        {(isReceiving || isRunningToolCalls) && (
          <button
            type="button"
            onClick={() => stop(true)}
            className={styles.stopButton}
          >
            Stop
          </button>
        )}
      </header>

      <div className={styles.messages} ref={scrollContainerRef}>
        {messages.length === 0 && (
          <div className={styles.placeholder}>
            Ask me to pivot, group, filter, or format the grid. I’ll apply the
            changes for you.
          </div>
        )}

        {messages.map((message, index) => {
          const key = `${message.role}-${index}`;

          if (message.role === "user") {
            return (
              <div
                key={key}
                className={`${styles.message} ${styles.messageUser}`}
              >
                <div className={styles.messageBubble}>
                  {renderContent(message.content)}
                </div>
                <span className={styles.avatar}>You</span>
              </div>
            );
          }

          if (message.role === "assistant") {
            return (
              <div
                key={key}
                className={`${styles.message} ${styles.messageAssistant}`}
              >
                <span className={styles.avatar}>AI</span>
                <div className={styles.messageBubble}>
                  {message.content ? (
                    <p className={styles.assistantText}>
                      {renderContent(message.content)}
                    </p>
                  ) : (
                    <p className={styles.assistantText}>
                      I’m working on your request.
                    </p>
                  )}

                  {message.toolCalls?.length > 0 && (
                    <div className={styles.toolCalls}>
                      {message.toolCalls.map((toolCall) => {
                        if (toolCall.status === "pending") {
                          return (
                            <div
                              key={toolCall.toolCallId}
                              className={`${styles.toolCall} ${styles.toolCallPending}`}
                            >
                              Running {toolCall.name}...
                            </div>
                          );
                        }

                        const callResult =
                          toolCall.result &&
                          toolCall.result.status === "fulfilled"
                            ? "Applied"
                            : "Failed";

                        return (
                          <div
                            key={toolCall.toolCallId}
                            className={`${styles.toolCall} ${
                              callResult === "Applied"
                                ? styles.toolCallSuccess
                                : styles.toolCallError
                            }`}
                          >
                            {callResult} {toolCall.name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={key}
              className={`${styles.message} ${styles.messageError}`}
            >
              <span className={styles.avatar}>!</span>
              <div className={styles.messageBubble}>
                {renderContent(message.content)}
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error.message}</span>
          <button type="button" onClick={reload}>
            Try again
          </button>
        </div>
      )}

      <form className={styles.composer} onSubmit={handleSubmit}>
        <textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask..."
          className={styles.input}
          rows={1}
          disabled={!isReady || isSending}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!isReady || !inputValue.trim() || isSending}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>

      <footer className={styles.statusBar}>
        {isBusy ? (
          <span>
            {isRunningToolCalls
              ? "Applying changes to the grid..."
              : "Thinking..."}
          </span>
        ) : (
          <span>Ready for your next request.</span>
        )}
      </footer>
    </div>
  );
}
