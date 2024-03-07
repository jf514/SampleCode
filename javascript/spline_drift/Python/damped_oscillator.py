import numpy as np
import matplotlib.pyplot as plt

def forced_damped_harmonic_oscillator_step(x, v, m, c, k, F, dt):
    """
    Perform one step of Euler's method for a forced, damped harmonic oscillator.

    Parameters:
        x (float): Current displacement.
        v (float): Current velocity.
        m (float): Mass.
        c (float): Damping coefficient.
        k (float): Spring constant.
        F (float): External force at the current time.
        dt (float): Time step size.

    Returns:
        Tuple[float, float]: Updated displacement and velocity.
    """
    a = (F - c * v - k * x) / m  # Calculate acceleration
    v_next = v + a * dt           # Update velocity
    x_next = x + v_next * dt      # Update displacement
    return x_next, v_next

def stub_forcing_function(t):
    """
    Stub function to generate values of the forcing function at different time steps.

    Parameters:
        t (float): Time.

    Returns:
        float: Value of the forcing function at time t.
    """
    # Example: a sinusoidal forcing function
    return np.sin(t)

# Initial conditions
x0 = 0.0    # Initial displacement
v0 = 0.0    # Initial velocity

# Oscillator parameters
m = 1.0     # Mass
c = 0.5     # Damping coefficient
k = 1.0     # Spring constant

# Time parameters
dt = 0.01   # Time step size
num_steps = 1000  # Number of time steps

# Arrays to store results
time_values = np.zeros(num_steps)
displacement_values = np.zeros(num_steps)
velocity_values = np.zeros(num_steps)

# Initial conditions
x = x0
v = v0

# Time loop
for i in range(num_steps):
    t = i * dt  # Current time
    F = stub_forcing_function(t)  # Calculate forcing function value at current time
    x, v = forced_damped_harmonic_oscillator_step(x, v, m, c, k, F, dt)  # Solve damped oscillator equation
    time_values[i] = t
    displacement_values[i] = x
    velocity_values[i] = v

# Plotting results
plt.figure(figsize=(10, 6))
plt.plot(time_values, displacement_values, label='Displacement')
plt.plot(time_values, velocity_values, label='Velocity')
plt.xlabel('Time')
plt.ylabel('Value')
plt.title('Forced Damped Harmonic Oscillator')
plt.legend()
plt.grid(True)
plt.show()
