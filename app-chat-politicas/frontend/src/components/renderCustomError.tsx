import { AxiosError } from 'axios';

import SplashError from './SplashError';
import SplashErrorNotAccess from './SplashErrorNotAccess';
import SplashErrorNotFound from './SplashErrorNotFound';

export const renderErrorComponent = (error: Error) => {
    const customError = error as unknown as AxiosError;
    const errorComponents: { [key: string]: JSX.Element } = {
        '404': <SplashErrorNotFound />,
        '403': <SplashErrorNotAccess />,
        default: <SplashError />
    };

    const statusCode = customError.response?.status?.toString() || 'default';

    return <main className='relative min-h-[80vh] min-w-[85vw]'> {errorComponents[statusCode] || errorComponents['default']} </main>;
};
