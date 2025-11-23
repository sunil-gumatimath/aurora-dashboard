import { supabase } from '../lib/supabase';

/**
 * Authentication Service - Handles user authentication with Supabase
 */
export const authService = {
    /**
     * Sign up a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {Object} metadata - Optional user metadata (name, etc.)
     * @returns {Promise<{user: Object|null, error: Error|null}>}
     */
    async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata, // Store additional user data
                },
            });

            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error) {
            console.error('Sign up error:', error);
            return { user: null, error };
        }
    },

    /**
     * Sign in an existing user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<{user: Object|null, session: Object|null, error: Error|null}>}
     */
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { user: data.user, session: data.session, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { user: null, session: null, error };
        }
    },

    /**
     * Sign out the current user
     * @returns {Promise<{error: Error|null}>}
     */
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Sign out error:', error);
            return { error };
        }
    },

    /**
     * Get the current user session
     * @returns {Promise<{session: Object|null, error: Error|null}>}
     */
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return { session: data.session, error: null };
        } catch (error) {
            console.error('Get session error:', error);
            return { session: null, error };
        }
    },

    /**
     * Get the current user
     * @returns {Promise<{user: Object|null, error: Error|null}>}
     */
    async getCurrentUser() {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error) {
            console.error('Get user error:', error);
            return { user: null, error };
        }
    },

    /**
     * Reset password for a user
     * @param {string} email - User email
     * @returns {Promise<{error: Error|null}>}
     */
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Reset password error:', error);
            return { error };
        }
    },

    /**
     * Update user password
     * @param {string} newPassword - New password
     * @returns {Promise<{user: Object|null, error: Error|null}>}
     */
    async updatePassword(newPassword) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error) {
            console.error('Update password error:', error);
            return { user: null, error };
        }
    },

    /**
     * Subscribe to auth state changes
     * @param {Function} callback - Callback function
     * @returns {Object} Subscription object with unsubscribe method
     */
    onAuthStateChange(callback) {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });

        return data;
    },
};
