import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Initialize Supabase client
const supabaseUrl = 'https://yewbshzfuuneacvgmylg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlld2JzaHpmdXVuZWFjdmdteWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDc5NjcsImV4cCI6MjA2MzU4Mzk2N30.lWBZFaH_CMcmLSzrBayRmqZxU7G_-JwXweg022HvOko'
const supabase = createClient(supabaseUrl, supabaseKey)

// Check if user is authenticated
export async function checkAuth() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        return !!user
    } catch (error) {
        console.error('Error checking auth:', error)
        return false
    }
}

// Sign in with email and password
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                // Abilita MFA se configurato
                shouldCreateUser: false,
                data: {
                    mfa_enabled: true
                }
            }
        })
        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error signing in:', error)
        return { data: null, error }
    }
}

// Sign up with email and password
export async function signUp(email, password) {
    try {
        // Validazione password
        if (!isStrongPassword(password)) {
            throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number and special character');
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })
        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error signing up:', error)
        return { data: null, error }
    }
}

// Funzione per validare la password
function isStrongPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
}

// Sign in with OAuth provider
export async function signInWithOAuth(provider) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider
        })
        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error signing in with OAuth:', error)
        return { data: null, error }
    }
}

// Sign out
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error signing out:', error)
        return { error }
    }
}

// Get user profile data
export async function getUserProfile() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting user profile:', error)
        return { data: null, error }
    }
}

// Update user profile
export async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
        if (error) throw error
        return data
    } catch (error) {
        console.error('Error updating user profile:', error.message)
        throw error
    }
}

// Update profile image
export async function updateProfileImage(userId, imageFile) {
    try {
        // Upload new image
        const { data: imageData, error: imageError } = await supabase.storage
            .from('profile-images')
            .upload(`${userId}/${imageFile.name}`, imageFile)
        if (imageError) throw imageError

        // Update profile with new image URL
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ profile_image: imageData.path })
            .eq('id', userId)
        if (updateError) throw updateError

        return imageData
    } catch (error) {
        console.error('Error updating profile image:', error.message)
        throw error
    }
}

// Export supabase client for direct use
export { supabase } 