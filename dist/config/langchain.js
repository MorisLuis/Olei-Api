"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureOpenAI = void 0;
require("dotenv/config");
const openai_1 = require("@langchain/openai");
exports.azureOpenAI = new openai_1.AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    temperature: 0.7,
});
//# sourceMappingURL=langchain.js.map