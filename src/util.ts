export const getJwtSecret = () => {
  return "abc123";
};

export const getOpenAiKey = () => {
  return "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";
};

export const getTipCount = () => {
  return 20;
};

export const getDisplayingTipCount = () => {
  return 5;
};

export const selectOpenAiChatModel = () => {
  const models = [
    "gpt-3.5-turbo-16k",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-1106",
    "gpt-4-0314",
    "gpt-4",
    "gpt-4-1106-preview",
    "gpt3.5-turbo-0613",
    "gpt-4-0613",
    "gpt-3.5-turbo-16k-0613",
    "gpt-3.5-turbo-0301",
  ];
  return models[4];
};
