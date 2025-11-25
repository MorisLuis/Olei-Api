import "dotenv/config";
import { AzureChatOpenAI } from "@langchain/openai";

export const azureOpenAI = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY!,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME!,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME!,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION!,
    temperature: 0.7,
});
