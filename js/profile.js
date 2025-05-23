import { checkAuth, getUserProfile, signOut } from '../js/supabase.js'

// Check if user is authenticated
const isAuthenticated = await checkAuth()
if (!isAuthenticated) {
    window.location.href = 'login.html'
}

// Load user profile data
async function loadProfile() {
    try {
        const { data: profile, error } = await getUserProfile()
        if (error) throw error

        // Update profile image
        const profileImage = document.getElementById('profileImage')
        if (profile.avatar_url) {
            profileImage.src = profile.avatar_url
        }

        // Update profile information
        document.getElementById('fullName').textContent = profile.full_name
        document.getElementById('location').textContent = profile.location
        document.getElementById('role').textContent = profile.role
        document.getElementById('bio').textContent = profile.bio

        // Update skills
        const skillsList = document.getElementById('skills')
        if (profile.skills && profile.skills.length > 0) {
            skillsList.innerHTML = profile.skills
                .map(skill => `<span class="skill-tag">${skill}</span>`)
                .join('')
        } else {
            skillsList.innerHTML = '<p>No skills added yet</p>'
        }

        // Update stats
        document.getElementById('projects').textContent = profile.projects || 0
        document.getElementById('posts').textContent = profile.posts || 0
        document.getElementById('experience').textContent = profile.experience || 0
    } catch (error) {
        console.error('Error loading profile:', error)
        alert('Error loading profile data')
    }
}

// Handle logout
document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        const { error } = await signOut()
        if (error) throw error
        window.location.href = 'index.html'
    } catch (error) {
        console.error('Error signing out:', error)
        alert('Error signing out')
    }
})

// Load profile data when page loads
loadProfile() 