// Utility to debug AssemblyAI environment variables

/**
 * Logs environment variable information for debugging AssemblyAI integration
 */
export function logEnvironmentVariableInfo() {
    console.group('🔍 AssemblyAI Environment Variables Debug');

    // Check if Vite environment variables are available
    const hasViteEnv = typeof import.meta.env !== 'undefined';
    console.log('Vite environment available:', hasViteEnv ? '✅ Yes' : '❌ No');

    // Check for specific environment variables
    const assemblyAPIKey = import.meta.env.VITE_ASSEMBLY_API_KEY;
    console.log('VITE_ASSEMBLY_API_KEY:', assemblyAPIKey
        ? `✅ Present (${assemblyAPIKey.substring(0, 4)}...${assemblyAPIKey.substring(assemblyAPIKey.length - 4)})`
        : '❌ Not found');

    // List all environment variables (helpful for debugging)
    console.log('All available Vite environment variables:');
    const envVars = Object.entries(import.meta.env)
        .filter(([key]) => key.startsWith('VITE_'))
        .map(([key, value]) => {
            // Mask the values for security
            const maskedValue = typeof value === 'string' && value.length > 8
                ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
                : value;
            return { key, value: maskedValue };
        });

    console.table(envVars);

    // Troubleshooting tips
    console.log('🔧 Troubleshooting tips:');
    console.log('1. Environment variables must be prefixed with VITE_ in .env files');
    console.log('2. Restart the dev server after changing .env files');
    console.log('3. In production, ensure environment variables are set on your hosting platform');

    console.groupEnd();
}

/**
 * Simplified check for AssemblyAI API key availability
 * @returns {boolean} True if the key is available
 */
export function isAssemblyAIKeyAvailable(): boolean {
    return !!import.meta.env.VITE_ASSEMBLY_API_KEY;
}

export default { logEnvironmentVariableInfo, isAssemblyAIKeyAvailable };
