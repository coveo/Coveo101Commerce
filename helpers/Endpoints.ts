const regionPlaceholder = '{region}';

const searchEndpoints: Record<string, string> = {
    dev: `https://platformdev${regionPlaceholder}.cloud.coveo.com`,
    staging: `https://platformqa${regionPlaceholder}.cloud.coveo.com`,
    prod: `https://platform${regionPlaceholder}.cloud.coveo.com`,
    hipaa: 'https://platformhipaa.cloud.coveo.com',
};

const analyticsEndpoints: Record<string, string> = {
    dev: `https://analyticsdev${regionPlaceholder}.cloud.coveo.com/rest/ua`,
    staging: `https://analyticsqa${regionPlaceholder}.cloud.coveo.com/rest/ua`,
    prod: `https://analytics${regionPlaceholder}.cloud.coveo.com/rest/ua`,
    hipaa: 'https://analyticshipaa.cloud.coveo.com/rest/ua',
};

export const getEndpoint = (type = "search"): string => {
    const environment = process.env.ENVIRONMENT ?? 'prod';
    const region = process.env.REGION ?? 'us';
    const regionSuffix = region === 'us' ? '' : `-${region}`;

    const matcher = new RegExp(regionPlaceholder, 'g');

    const template = type === 'analytics' ? analyticsEndpoints[environment] : searchEndpoints[environment];

    return template?.replace(matcher, regionSuffix) ?? '';
};
