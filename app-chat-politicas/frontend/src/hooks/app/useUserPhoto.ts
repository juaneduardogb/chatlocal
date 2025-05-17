import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';

import { viteGraphUserPhotoUrl } from '@/constants/config';

export type UseUserPhotoResult = {
    photoUrl: string | null;
};

const useUserPhoto = async (instance: IPublicClientApplication, account: AccountInfo | null): Promise<UseUserPhotoResult> => {
    try {
        if (account === null) {
            return { photoUrl: null };
        }
        const response = await instance.acquireTokenSilent({
            scopes: ['User.Read'], // Reemplaza con los scopes que necesites
            account: account
        });

        const options = {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${response.accessToken}`,
                'Allowed-Origins': '*',
                'Allowed-Methods': 'GET, POST, PUT',
                'Allowed-Headers': 'Content-Type, Authorization'
            }
        };

        const photoResponse = await fetch(viteGraphUserPhotoUrl + '$value', options);

        if (!photoResponse.ok) {
            throw new Error(`HTTP error! status: ${photoResponse.status}`);
        }

        const photoBlob = await photoResponse.blob();
        const photoUrl = URL.createObjectURL(photoBlob);

        return { photoUrl };
    } catch (error: unknown) {
        return { photoUrl: null };
    }
};

export default useUserPhoto;
