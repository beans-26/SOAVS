import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassPanel } from '@/components/GlassPanel';
import { StatusModal } from '@/components/StatusModal';
import { Colors } from '@/constants/theme';
import api from '@/services/api';
import { LogIn, User, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

  const router = useRouter();

  const handleLogin = async () => {
    if (!studentId || !password) {
      setErrorModal({ visible: true, title: 'Required', message: 'Please enter your Student ID and Password.' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/voter/login/', {
        student_id: studentId,
        password: password,
      });

      await AsyncStorage.setItem('voter_data', JSON.stringify(response.data));
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let msg = 'Failed to authenticate. Please check your credentials.';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.error) msg = data.error;
        else if (data.non_field_errors) msg = data.non_field_errors[0];
        else if (data.detail) msg = data.detail;
        else if (typeof data === 'object') {
          // Flatten first field error if available
          const firstKey = Object.keys(data)[0];
          if (Array.isArray(data[firstKey])) msg = `${firstKey}: ${data[firstKey][0]}`;
        }
      } else if (error.message) {
        msg = error.message;
      }
      
      setErrorModal({ visible: true, title: 'Authentication Error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#0f172a', '#020617']}
        style={styles.bgGradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.headerArea}>
              <Text style={styles.title}>SOAVS</Text>
              <Text style={styles.subtitle}>Student Voting Portal</Text>
            </View>

            <GlassPanel style={styles.loginCard} intensity={60}>
              <Text style={styles.cardTitle}>Student Login</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Student ID</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2023102847"
                    placeholderTextColor="#64748b"
                    value={studentId}
                    onChangeText={setStudentId}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Enter</Text>
                    <LogIn size={20} color="#fff" style={{marginLeft: 10}} />
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.footerNote}>
                Use your Student ID as your password.
              </Text>
            </GlassPanel>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>

      <StatusModal 
        visible={errorModal.visible}
        type="error"
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ ...errorModal, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loginCard: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footerNote: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  }
});
