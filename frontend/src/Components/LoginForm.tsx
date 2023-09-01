import { TextInput, Checkbox, Button, Group, Box, PasswordInput, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import { useStorageState } from '../App';
import { UserData } from '../Login';
import { IconAlertCircle } from '@tabler/icons-react'
import * as React from 'react';

interface Login {
    email: string,
    password: string,
    termsOfService: boolean,
}


export function LoginForm() {

  const [errorMessage, setErrorMessage] = React.useState('');

  const [user, setUser] = useStorageState(
    'user', ''
  );
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      termsOfService: false,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email')
    }
  });

    const loginUser = async (values: Login)  => {
      try{
        const data = {
          email: values.email,
          password: values.password
        }
        const result = await axios.post('http://192.168.2.216:5000/login', data, { 
          })
        //Convert JSON to Vinyl and Pagination type
        const res: UserData = result.data;

        setUser(res.email)

        window.location.reload();

      } catch (error: any) { 
        if(error.response){
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          setErrorMessage(error.response.status.toString() + ' ' + error.response.data.error.toString());
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log("No response", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
    };
  }

  console.log(form.values);
  return (
    <>
    {errorMessage && 
    <Alert icon={<IconAlertCircle size="1rem" />} title="Oh oh!" color="red">
      {errorMessage}
    </Alert>
    }
    <br></br>
    <Box maw={300} mx="auto">
      <form onSubmit={form.onSubmit((values) => loginUser(values))}>
        <TextInput
          withAsterisk
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Password"
          {...form.getInputProps('password')}
        />

        <Checkbox
          mt="md"
          label="I agree to sell my privacy"
          {...form.getInputProps('termsOfService', { type: 'checkbox' })}
        />

        <Group position="right" mt="md">
          <Button type="submit">Login</Button>
        </Group>
      </form>
    </Box>
    </>
  );
}