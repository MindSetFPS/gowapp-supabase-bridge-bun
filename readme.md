# Gowap Supabase Bridge

Connects gowapp to supabase

When a new gowapp-container is created, and a user loggs in with his whatsapp account, 
this wapp container will make post requests to /webhook/{business_id}.

In this request, we will

1. Get the device phone number
2. Save it as user contact
3. Set container as connected
4. Redeploy container with webhook set as /webhook/connected/{business_id}

when a request hits  /webhook/connected/{business_id}

1. Read incoming webhook
2. If message, then:
2.1. check if its not comming from the user
2.1.a if comes from the user: ignore
2.1.b if it doesnt, check if user is in supabase database, and save it if so
2.1.b.a also, generate a text response and save it in the supabase database