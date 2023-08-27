import { Button, Transition, Affix, rem} from '@mantine/core';
import { IconArrowUp } from '@tabler/icons-react';
import { useWindowScroll, useDisclosure } from '@mantine/hooks';
import * as React from 'react';


type ScrollerProps = {
    
}

export const Scroller: React.FC<ScrollerProps> = () => {
    const [scroll, scrollTo] = useWindowScroll();

    return (
    <Affix position={{ bottom: rem(20), right: rem(20) }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
        {(transitionStyles) => (
            <Button
            leftIcon={<IconArrowUp size="1rem" />}
            style={transitionStyles}
            variant="gradient" gradient={{ from: 'teal', to: 'blue', deg: 60 }}
            onClick={() => scrollTo({ y: 0 })}
            >
            Scroll to top
            </Button>
        )}
        </Transition>
    </Affix>
    );
};

export default Scroller