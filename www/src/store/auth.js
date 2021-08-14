import axios from "axios";

export default {
    namespaced: true,
    state: {
        expires_at: '',
        access_token: '',
        remember_token: '',
        user_id: '',
        user_name: '',
    },
    mutations: {
        setToken(state, data) {
            state.expires_at = data.expiresAt;
            state.access_token = data.accessToken;
            state.remember_token = data.rememberToken;
            state.user_id = data.userId;
            state.user_name = data.userName;

            localStorage.setItem('access_token', JSON.stringify({
                expires_at: state.expires_at,
                access_token: state.access_token,
                remember_token: state.remember_token,
                user_id: state.user_id,
                user_name: state.user_name
            }));
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.access_token}`;
        }
    },
    actions: {
        auth({commit}, payload) {
            return new Promise((resolve, reject) => {
                axios.post('/api/v1/login', {
                    email: payload.email,
                    password: payload.password,
                    remember: payload.remember ? 'yes' : 'no'
                }).then(response =>  {
                    const jwtData = parseJwt(response.data.accessToken);

                    commit('setToken', {
                        expiresAt: response.data.expiresAt,
                        accessToken: response.data.accessToken,
                        rememberToken: response.data.rememberToken,
                        userId: jwtData.id,
                        userName: jwtData.name,
                    });

                    resolve(response);
                    return;
                }).catch(err => {
                    reject(err);
                    return;
                })
            });
        },
        load({commit, dispatch}) {
            return new Promise((resolve) => {
                const expiresAt = JSON.parse(localStorage.getItem('access_token') || '{}').expires_at;
                const accessToken = JSON.parse(localStorage.getItem('access_token') || '{}').access_token;
                const rememberToken = JSON.parse(localStorage.getItem('access_token') || '{}').remember_token;
                const userId = JSON.parse(localStorage.getItem('access_token') || '{}').user_id;
                const userName = JSON.parse(localStorage.getItem('access_token') || '{}').user_name;
    
                if (expiresAt != '' && expiresAt - 300 < new Date().getTime() / 1000) {
                    if (rememberToken != null) {
                        // When expired but a refresh token is present
                        axios.post('/api/v1/refresh', {
                            user_id: userId,
                            remember_token: rememberToken
                        }).then(response => {
                            console.log(response.data);
    
                            const jwtData = parseJwt(response.data.accessToken);
    
                            commit('setToken', {
                                expiresAt: response.data.expiresAt,
                                accessToken: response.data.accessToken,
                                rememberToken: response.data.rememberToken,
                                userId: jwtData.id,
                                userName: jwtData.name,
                            });

                            resolve();
                        }).catch(error => {
                            console.error(error);
                            dispatch('logout');
                            resolve();
                        });
                    } else {
                        // When expired but no refresh token is present
                        commit('setToken', {
                            expiresAt,
                            accessToken,
                            rememberToken,
                            userId,
                            userName
                        });
    
                        localStorage.removeItem('access_token');
                        resolve();
                    }
                } else {
                    // When not expired
                    commit('setToken', {
                        expiresAt,
                        accessToken,
                        rememberToken,
                        userId,
                        userName
                    });
                    resolve();
                }
            });
        },
        logout({commit}) {
            commit('setToken', {
                expiresAt: '',
                accessToken: '',
                rememberToken: '',
                userId: '',
                userName: ''
            });

            window.location.reload();
        }
    },
    getters: {
        loggedIn: state => {
            return state.access_token != '' && state.expires_at != '' && state.expires_at > new Date().getTime() / 1000;
        }
    }
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export { parseJwt }