
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface User {
  email: string;
  password: string;
  name: string;
}

interface Note {
  title: string;
  content: string;
}

const dummyUsers: User[] = [
  { email: 'alice@example.com', password: 'password123', name: 'Alice Johnson' },
  { email: 'bob@example.com', password: 'password123', name: 'Bob Smith' },
  { email: 'charlie@example.com', password: 'password123', name: 'Charlie Brown' },
  { email: 'diana@example.com', password: 'password123', name: 'Diana Prince' },
  { email: 'eve@example.com', password: 'password123', name: 'Eve Wilson' },
];

const dummyNotes: Note[] = [
  { title: 'Meeting Notes', content: 'Discussed project timeline and key deliverables for Q4.' },
  { title: 'Recipe: Chocolate Cake', content: 'Ingredients: flour, cocoa powder, sugar, eggs, butter...' },
  { title: 'Book Recommendations', content: 'The Pragmatic Programmer, Clean Code, Design Patterns' },
  { title: 'Travel Plans', content: 'Visit Paris in spring, see the Eiffel Tower, Louvre Museum' },
  { title: 'Workout Routine', content: 'Monday: Chest and triceps, Tuesday: Back and biceps, Wednesday: Legs' },
  { title: 'Shopping List', content: 'Milk, bread, eggs, vegetables, fruits, coffee beans' },
  { title: 'Project Ideas', content: 'Build a todo app, create a weather dashboard, develop a chat application' },
  { title: 'Daily Reflection', content: 'Today was productive. Completed 3 major tasks and learned about React hooks.' },
  { title: 'Budget Planning', content: 'Monthly expenses: rent $1200, groceries $400, utilities $200' },
  { title: 'Learning Goals', content: 'Master TypeScript, learn Docker, improve system design knowledge' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Starting to seed dummy data...')

    // Create dummy users and their notes
    for (const user of dummyUsers) {
      console.log(`Creating user: ${user.email}`)
      
      // Create user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name }
      })

      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError)
        continue
      }

      const userId = authData.user.id

      // Create 3-5 random notes for each user
      const notesToCreate = Math.floor(Math.random() * 3) + 3
      const shuffledNotes = [...dummyNotes].sort(() => Math.random() - 0.5)
      
      for (let i = 0; i < notesToCreate; i++) {
        const note = shuffledNotes[i]
        const { error: noteError } = await supabase
          .from('notes')
          .insert({
            user_id: userId,
            title: note.title,
            content: note.content,
          })

        if (noteError) {
          console.error(`Error creating note for user ${user.email}:`, noteError)
        }
      }

      console.log(`Created ${notesToCreate} notes for user: ${user.email}`)
    }

    console.log('Successfully seeded dummy data!')

    return new Response(
      JSON.stringify({
        message: 'Successfully seeded dummy data!',
        users_created: dummyUsers.length,
        notes_per_user: '3-5 random notes'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error seeding data:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
