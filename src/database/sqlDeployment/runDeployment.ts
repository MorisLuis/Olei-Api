import { runDeploymentCli } from './deploy';
import { getDeploymentErrorMessage } from './errors';

runDeploymentCli(process.argv.slice(2)).catch(error => {
    console.error(`Deployment failed: ${getDeploymentErrorMessage(error)}`);
    process.exitCode = 1;
});
