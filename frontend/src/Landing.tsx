import { SimpleGrid, Alert, Center } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';


export const Welcome = () => {


    return (
        <>
        <SimpleGrid 
        cols={3}
            spacing="lg"
            breakpoints={[
              { maxWidth: 'md', cols: 3, spacing: 'md' },
              { maxWidth: 'sm', cols: 2, spacing: 'sm' },
              { maxWidth: 'xs', cols: 1, spacing: 'sm' },
            ]}
        >
            <div></div>
            <div>
                <Alert icon={<IconAlertCircle size="1rem" />} title="Hey!" color="blue">
                    Login in with your Discogs credentials to get a personalized Dashboard, special offers and more!
                    </Alert>
                    <br></br><br></br>
                    <Center>
                        <p>Hey!</p>
                    </Center>
            </div>
            <div></div>
        </SimpleGrid>
        </>
    );
};