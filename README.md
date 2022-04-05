# url-health-monitor

**After cloning the project on your own personal machine**
Start off by installing all required dependancies in the `Package.json` By Running the following command:

```
npm i
```

**_OPTIONAL_** You will find a postman **`url-health-monitor.postman-collection.json`** file in the cloned project , feel free to import in into your postman client to use the endpoints at ease.

**_Now_** you need to create a **`.env `** file on your root directory which follows the given **`.env.example`** file that was provided when cloning the project.

**For Development purposes**
We've gone ahead and filled out the **`.env.example`** File with valid data that can be used for Development / Testing our API. \*\*Don't Forget to never expose your production`.env` file.\*\*

**Now that everything is setup correctly, start the server in development mode by running:**

```
npm run dev
```

**OR You can run the tests by running this script in the terminal:**

```
npm test
```

This Will run your server on [localhost:3000](localhost:3000).

---

## Now That Everything is setup correctly, you can start using our API through the following routes:

### _1. User Authentication Routes:_

**\*All routes are prefixed with `/api/user`**.

| Route       | Method | Function        | require Authentication |
| ----------- | ------ | --------------- | ---------------------- |
| `/register` | POST   | Create new user | No                     |

**Parameters:**

```


username: minimum 6 characters (required)

email:(required)

password: minimum 6 characters (required)


```

---

| Route    | Method | Function            | require Authentication |
| -------- | ------ | ------------------- | ---------------------- |
| `/login` | POST   | login verified user | No                     |

**Parameters:**

> ( username or email must be provided )

```

username: minimum 6 characters

email:String

password: minimum 6 characters,(required)


```

---

| Route            | Method | Function                      | require Authentication |
| ---------------- | ------ | ----------------------------- | ---------------------- |
| `/user-by-token` | GET    | Get user details from the JWT | Yes                    |

**Parameters:**

```
No Parameters Needed.
```

---

| Route     | Method | Function             | require Authentication |
| --------- | ------ | -------------------- | ---------------------- |
| `/update` | PUT    | Updated User Details | Yes                    |

**Parameters:**

```

username: minimum 6 characters

email

oldPassword: the old password to be changed

newPassword:new password to be set ( minimum 6 characters)


```

---

| Route                                    | Method | Function                  | require Authentication |
| ---------------------------------------- | ------ | ------------------------- | ---------------------- |
| `/verify/resendVerificationEmail/:email` | POST   | Resend verification Email | No                     |

**Parameters:**

```

email (required)

```

---

| Route                                      | Method | Function                                                                  | Params | require Authentication |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------- | ------ | ---------------------- |
| `/verify/:userId/:hashedVerificationToken` | GET    | Verify Email (from the email sent to the user with the verification link) | No     |

**Parameters:**

> These are provided automatically on the verification E-mail that is sent to the user upon registering

```


userId: string

hashedVerificationToken: string


```

---

---

### _2.Alert Contacts Routes:_

**\*All routes are prefixed with `/api/alertContacts`**.

| Route | Method | Function                      | require Authentication |
| ----- | ------ | ----------------------------- | ---------------------- |
| `/`   | GET    | Get All User's Alert Contacts | Yes                    |

**Parameters:**

```

No Parameters Needed.

```

---

| Route              | Method | Function           | require Authentication |
| ------------------ | ------ | ------------------ | ---------------------- |
| `/:alertContactId` | GET    | Get Monitor By ID. | Yes                    |

**Parameters:**

```


alertContactId: String (required).


```

---

| Route     | Method | Function                                        | require Authentication |
| --------- | ------ | ----------------------------------------------- | ---------------------- |
| `/create` | POST   | Create new Alert Contact and assign it to user. | Yes                    |

**Parameters:**

```
-   `friendly_name`:(required) The name of the alert contact.

-   `type`:(required) The Type of the alert contact , must be one of these values:
      .email
      .webhook
      .pushover

-   `value`:(required) The actual alert contact details , following this schema:
      .if type = email: email@domain.com
      .if type = webhook: webhook URL
      .if type = pushover: pushover User Key

```

---

| Route                     | Method | Function                           | require Authentication |
| ------------------------- | ------ | ---------------------------------- | ---------------------- |
| `/update/:alertContactId` | PUT    | Update Alert Contact Details By ID | Yes                    |

**Parameters:**

```
-   `alertContactId`: String (required).

-   `friendly_name`:(optional) The name of the alert contact.

-   `value`:(optional) value is only updatable if the alert contact type is "webhook",
    if it's any other type, it's recommended that you remove it and add it again.

```

---

| Route                         | Method | Function                   | require Authentication |
| ----------------------------- | ------ | -------------------------- | ---------------------- |
| `/delete/one/:alertContactId` | DELETE | Delete Alert Contact By ID | Yes                    |

**Parameters:**

```


alertContactId: String (required).


```

---

| Route         | Method | Function                         | require Authentication |
| ------------- | ------ | -------------------------------- | ---------------------- |
| `/delete/all` | DELETE | Delete All User's Alert Contacts | Yes                    |

**Parameters:**

```
No Parameters Needed.
```

---

---

### _3.URL Monitors Routes:_

**\*All routes are prefixed with `/api/monitors`**.

| Route | Method | Function                | require Authentication |
| ----- | ------ | ----------------------- | ---------------------- |
| `/`   | GET    | Get All User's Monitors | Yes                    |

**Parameters:**

```

No Parameters Needed.

```

---

| Route         | Method | Function           | require Authentication |
| ------------- | ------ | ------------------ | ---------------------- |
| `/:monitorId` | GET    | Get Monitor By ID. | Yes                    |

**Parameters:**

```


monitorId: String (required).


```

---

| Route     | Method | Function                                  | require Authentication |
| --------- | ------ | ----------------------------------------- | ---------------------- |
| `/create` | POST   | Create new Monitor and assign it to user. | Yes                    |

**Parameters:**
alertContacts: Joi.array().items({
alertContactId: Joi.string(),
threshold: Joi.number(),
recurrence: Joi.number(),

```
-   `friendly_name`: The name of the monitor. (required)

-   `url`: The URL to be monitored. (required)

-   `port`: The server port number  (optional).

-   `timeout`  (defaults to 5 seconds): The timeout of the polling request  (optional).

-   `interval`  (defaults to 10 minutes): The time interval for polling requests  (optional).

-   `custom_http_headers`: A list of key/value pairs custom HTTP headers to be sent with the polling request (optional).

-   `tags`: Array of Strings (optional).

-   `authentication`:(optional) An HTTP authentication header, with the Basic scheme, to be sent with the polling request .
                    . authentication.username
                    . authentication.password

-   `alertContacts`: (optional) Array Of alert contacts details (Object) following this format:
        . alertContactId: alert contact Id created after creating a new alert contact.
        . threshold: (defaults to 1 failure): the x value that is set to define "if down for x minutes, alert every y minutes.
        . recurrence: (defaults to 0 minutes): the y value that is set to define "if down for x minutes, alert every y minutes.

```

---

| Route                | Method | Function                     | require Authentication |
| -------------------- | ------ | ---------------------------- | ---------------------- |
| `/update/:monitorId` | PUT    | Update Monitor Details By ID | Yes                    |

**Parameters:**

```
-   `monitorId`: String (required).

-   `friendly_name`: The name of the monitor. (optional).

-   `url`: The URL to be monitored. (optional).

-   `port`: The server port number  (optional).

-   `timeout`  (defaults to 5 seconds): The timeout of the polling request  (optional).

-   `interval`  (defaults to 10 minutes): The time interval for polling requests  (optional).

-   `custom_http_headers`: A list of key/value pairs custom HTTP headers to be sent with the polling request (optional).

-   `tags`: Array of Strings (optional).

-   `authentication`:(optional)  An HTTP authentication header, with the Basic scheme, to be sent with the polling request .
                    . authentication.username
                    . authentication.password

-   `alertContacts`: (optional) Array Of alert contacts details (Object) following this format:
        . alertContactId: alert contact Id created after creating a new alert contact.
        . threshold: (defaults to 1 failure): the x value that is set to define "if down for x minutes, alert every y minutes.
        . recurrence: (defaults to 0 minutes): the y value that is set to define "if down for x minutes, alert every y minutes.

```

---

| Route                    | Method | Function             | require Authentication |
| ------------------------ | ------ | -------------------- | ---------------------- |
| `/delete/one/:monitorId` | DELETE | Delete Monitor By ID | Yes                    |

**Parameters:**

```


monitorId: String (required).


```

---

| Route         | Method | Function                   | require Authentication |
| ------------- | ------ | -------------------------- | ---------------------- |
| `/delete/all` | DELETE | Delete All User's Monitors | Yes                    |

**Parameters:**

```
No Parameters Needed.
```
