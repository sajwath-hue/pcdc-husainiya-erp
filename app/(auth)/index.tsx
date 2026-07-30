import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/constants/theme';

export default function LoginScreen() {
  const { signIn, resetPassword, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email above first, then tap "Forgot password".');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert('Check your inbox', `A password reset link was sent to ${email.trim()}.`);
    } catch (err) {
      setError(mapAuthError(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Al Husainiya ERP</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {!configured ? (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              Supabase is not configured yet. Add your project URL and anon key to a .env file
              (see .env.example) before signing in.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <PrimaryButton title="Sign In" onPress={handleLogin} loading={loading} />

        <Text style={styles.forgot} onPress={handleForgotPassword}>
          Forgot password?
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function mapAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'invalid_credentials':
      return 'Incorrect email or password.';
    case 'email_not_confirmed':
      return 'Please confirm your email address before signing in.';
    case 'user_banned':
      return 'This account has been disabled. Contact an administrator.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return (err as Error)?.message ?? 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 72, height: 72, marginBottom: 12, borderRadius: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  warningBanner: {
    backgroundColor: '#78350F',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  warningText: { color: '#FDE68A', fontSize: 13 },
  errorBanner: {
    backgroundColor: '#7F1D1D',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#FECACA', fontSize: 13 },
  forgot: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    fontWeight: '600',
  },
});
