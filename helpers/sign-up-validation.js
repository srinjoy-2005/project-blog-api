// helpers/auth-validation.js
function validateSignupData(data) {
  const { username, fullname, password, confirmPassword } = data || {}
  const errors = []
  const cleaned = {
    username: username?.trim(),
    fullname: fullname?.trim(),
    password,
    confirmPassword
  }

  if (!cleaned.username || !cleaned.fullname || !cleaned.password || !cleaned.confirmPassword) {
    errors.push('All fields are required.')
  }

  if (cleaned.password !== cleaned.confirmPassword) {
    errors.push('Passwords do not match.')
  }

  if (cleaned.password?.length < 6) {
    errors.push('Password must be at least 6 characters.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    dbData: errors.length === 0
      ? {
          username: cleaned.username,
          fullname: cleaned.fullname,
          rawPassword: cleaned.password
        }
      : null
  }
}

function validateLoginData(data) {
  const { username, password } = data || {}
  const errors = []

  if (!username?.trim()) errors.push('Username is required.')
  if (!password) errors.push('Password is required.')

  return {
    isValid: errors.length === 0,
    errors,
    credentials: { username: username?.trim(), password }
  }
}

export { validateSignupData, validateLoginData }