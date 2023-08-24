import { createStyles, Container, Title, Text, Button, Group, rem, Modal, Box, TextInput, Checkbox } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: '#11284b',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage:
      'linear-gradient(250deg, rgba(130, 201, 30, 0) 0%, #062343 70%), url(https://www.google.com/url?sa=i&url=https%3A%2F%2Fwallpapercave.com%2Fkurt-cobain-smoking-wallpaper&psig=AOvVaw3sQuKr5s45qs7-HBhRfmbS&ust=1692106105337000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCKCT5LOg3IADFQAAAAAdAAAAABAE)',
    paddingTop: `calc(${theme.spacing.xl} * 3)`,
    paddingBottom: `calc(${theme.spacing.xl} * 3)`,
  },

  inner: {
    display: 'flex',
    justifyContent: 'space-between',

    [theme.fn.smallerThan('md')]: {
      flexDirection: 'column',
    },
  },

  image: {
    [theme.fn.smallerThan('md')]: {
      display: 'none',
    },
  },

  content: {
    paddingTop: `calc(${theme.spacing.xl} * 2)`,
    paddingBottom: `calc(${theme.spacing.xl} * 2)`,
    marginRight: `calc(${theme.spacing.xl} * 3)`,

    [theme.fn.smallerThan('md')]: {
      marginRight: 0,
    },
  },

  title: {
    color: theme.white,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 900,
    lineHeight: 1.05,
    maxWidth: rem(500),
    fontSize: rem(48),

    [theme.fn.smallerThan('md')]: {
      maxWidth: '100%',
      fontSize: rem(34),
      lineHeight: 1.15,
    },
  },

  description: {
    color: theme.white,
    opacity: 0.75,
    maxWidth: rem(500),

    [theme.fn.smallerThan('md')]: {
      maxWidth: '100%',
    },
  },

  control: {
    paddingLeft: rem(50),
    paddingRight: rem(50),
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontSize: rem(22),

    [theme.fn.smallerThan('md')]: {
      width: '100%',
    },
  },
}));


export function HeroImageRight() {
  const { classes } = useStyles();
  const [subscribeOpened, { open, close }] = useDisclosure(false);
  const form = useForm({
    initialValues: {
      email: '',
      termsOfService: false,
    },
  
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });
  return (
    <div className={classes.root}>
      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              Welcome to{' '}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: 'pink', to: 'yellow' }}
              >
                Jules Vinyls
              </Text>{' '}
              where vinyls are the cheapest and best.
            </Title>

            <Text className={classes.description} mt={30}> 
              Don't miss anything.
            </Text>

            <Button
              variant="gradient"
              gradient={{ from: 'pink', to: 'yellow' }}
              size="xl"
              className={classes.control}
              mt={40}
              onClick={open}
            >
              Subscribe to our newsletter!
            </Button>
            <Modal opened={subscribeOpened} onClose={close} title="Newsletter">
                <Box maw={300} mx="auto">
                  <form onSubmit={form.onSubmit((values) => console.log(values))}>
                    <TextInput
                      withAsterisk
                      label="Email"
                      placeholder="your@email.com"
                      {...form.getInputProps('email')}
                    />

                    <Checkbox
                      mt="md"
                      label="I agree to sell my privacy"
                      {...form.getInputProps('termsOfService', { type: 'checkbox' })}
                    />

                    <Group position="right" mt="md">
                      <Button type="submit">Submit</Button>
                    </Group>
                  </form>
                </Box>
            </Modal>
          </div>
        </div>
      </Container>
    </div>
  );
}