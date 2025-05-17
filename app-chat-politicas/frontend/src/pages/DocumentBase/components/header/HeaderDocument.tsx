import { Button } from '@heroui/react';
import { Divider } from 'antd';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
type TabsContentAndTitles = {
    title: string;
    content: React.JSX.Element;
};

export type ButtonCallToAction = {
    title: string | JSX.Element;
    onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
    className?: string;
    disabled?: boolean;
};

interface IHeaderDocumentProps {
    headerTitle: string;
    tabsContentAndTitles?: TabsContentAndTitles[];
    buttonsCallToAction?: ButtonCallToAction[] | null;
}

export default function HeaderDocument({ headerTitle, tabsContentAndTitles, buttonsCallToAction }: IHeaderDocumentProps) {
    return (
        <>
            <section className='flex justify-between flex-wrap gap-2 items-center'>
                <h1 className='text-xl font-medium xs:text-[1rem]'>{headerTitle}</h1>
                <div className='flex flex-wrap gap-3 items-center'>
                    {buttonsCallToAction &&
                        buttonsCallToAction.map((button, index) => (
                            <Button
                                color='primary'
                                className={'md:text-md xs:text-xs p-0 m-0 px-4 ' + button.className}
                                onClick={button.onClick}
                                disabled={!!button.disabled ? button.disabled : false}
                                key={index}
                            >
                                {button.title}
                            </Button>
                        ))}
                </div>
            </section>

            {!!tabsContentAndTitles && (
                <>
                    <Divider className='my-2' />
                    <Tabs defaultValue={tabsContentAndTitles[0].title}>
                        <TabsList className='grid grid-cols-3  max-w-[600px]'>
                            {tabsContentAndTitles.map(tabItem => (
                                <TabsTrigger value={`${tabItem.title}`}>{tabItem.title}</TabsTrigger>
                            ))}
                        </TabsList>
                        {tabsContentAndTitles.map(tabItem => (
                            <TabsContent value={`${tabItem.title}`}>{tabItem.content}</TabsContent>
                        ))}
                    </Tabs>
                </>
            )}
        </>
    );
}
