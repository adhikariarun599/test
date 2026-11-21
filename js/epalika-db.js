
        // Server-based Authentication
        // Local password authentication is disabled.
        authenticate: function() {
            console.warn('Local authentication disabled. Use loginToServer().');
            return null;
        },

        // Cloudflare Worker API
        authApiBase: 'https://epalika-api.info-arunadhikari2053.workers.dev',

        // Admin Login
        loginToServer: async function(username, password) {
            try {
                const response = await fetch(
                    `${this.authApiBase}/api/auth/login`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    }
                );

                const data = await response.json().catch(() => ({}));

                if (!response.ok || !data.success || !data.token || !data.user) {
                    return {
                        success: false,
                        message: data.message || 'Login failed'
                    };
                }

                sessionStorage.setItem('epalika_jwt_token', data.token);

                return data;

            } catch (error) {
                console.error('Server Login Error:', error);

                return {
                    success: false,
                    message: 'सर्भरसँग सम्पर्क हुन सकेन। कृपया पुनः प्रयास गर्नुहोस्।'
                };
            }
        },

        // Verify Existing Server Session
        verifyServerSession: async function() {
            try {
                const token = sessionStorage.getItem('epalika_jwt_token');

                if (!token) {
                    return { success: false };
                }

                const response = await fetch(
                    `${this.authApiBase}/api/auth/me`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json().catch(() => ({}));

                if (!response.ok || !data.success || !data.user) {
                    this.clearServerSession();

                    return {
                        success: false,
                        message: data.message || 'Session expired'
                    };
                }

                return data;

            } catch (error) {
                console.error('Session Verification Error:', error);

                return {
                    success: false,
                    networkError: true,
                    message: 'Server connection failed'
                };
            }
        },

        // Clear Server Session
        clearServerSession: function() {
            sessionStorage.removeItem('epalika_jwt_token');
        },
