import numpy as np
import matplotlib.pyplot as plt

# Define function to solve forced damped oscillator using Euler's method
def forced_damped_oscillator_solver(x0, v0, m, c, k, forcing_func, dt, num_steps):
    x = x0
    v = v0
    x_values = [x0]
    for _ in range(num_steps):
        F = forcing_func(_, dt)  # Use forcing function
        a = (F - c * v - k * x) / m
        v += a * dt
        x += v * dt
        x_values.append(x)
    return np.array(x_values)

# Define sinusoidal forcing function
def sinusoidal_forcing(t, dt):
    return np.sin(t + dt)

# Parameters for forced damped oscillator
x0 = 0.0    # Initial displacement
v0 = 0.0    # Initial velocity
m = 1.0     # Mass
c = 0.1     # Damping coefficient
k = 1.0     # Spring constant
dt = 0.01   # Time step size
num_steps = 1000  # Number of time steps

# Solve forced damped oscillator with sinusoidal forcing function
displacements = forced_damped_oscillator_solver(x0, v0, m, c, k, sinusoidal_forcing, dt, num_steps)

# Plot the displacement over time
plt.plot(displacements)
plt.xlabel('Time Step')
plt.ylabel('Displacement')
plt.title('Forced Damped Oscillator with Sinusoidal Forcing Function')
plt.show()
