import numpy as np
import matplotlib.pyplot as plt

# Define functions for cubic Bézier curve and its derivatives
def bezier_point(P0, P1, P2, P3, t):
    return (1-t)**3*P0 + 3*(1-t)**2*t*P1 + 3*(1-t)*t**2*P2 + t**3*P3

def bezier_derivative(P0, P1, P2, P3, t):
    return 3*(1-t)**2*(P1 - P0) + 6*(1-t)*t*(P2 - P1) + 3*t**2*(P3 - P2)

def bezier_second_derivative(P0, P1, P2, P3, t):
    return 6*(1-t)*(P2 - 2*P1 + P0) + 6*t*(P3 - 2*P2 + P1)

# Compute signed scalar curvature from cubic Bézier curve
def signed_curvature(P0, P1, P2, P3, t):
    dT_dt = bezier_derivative(P0, P1, P2, P3, t)
    ddT_dt2 = bezier_second_derivative(P0, P1, P2, P3, t)
    curvature = (dT_dt[0] * ddT_dt2[1] - dT_dt[1] * ddT_dt2[0]) / \
                (np.linalg.norm(dT_dt) ** 3)
    return np.sign(curvature) * np.abs(curvature)

# Define damped oscillator solver using Euler's method
def damped_oscillator_solver(x0, v0, m, c, k, forcing_func, dt, num_steps):
    t = 0
    x = x0
    v = v0
    x_values = [x0]
    for _ in range(num_steps):
        F = forcing_func(t)  # Use curvature as forcing function
        a = (F - c * v - k * x) / m
        v += a * dt
        x += v * dt
        x_values.append(x)
        t += dt
    return np.array(x_values)

# Define a function to represent the angle of a vector relative to the tangent vector
def angle_function(x):
    return x  # Simple example, can be modified as needed

# Bézier control points
P0 = np.array([0.0, 0.0])
P1 = np.array([1.0, 2.0])
P2 = np.array([2.0, -2.0])
P3 = np.array([3.0, 0.0])

# Parameters for damped oscillator
x0 = 0.0    # Initial displacement
v0 = 0.0    # Initial velocity
m = 1.0     # Mass
c = 2.0     # Damping coefficient
k = 1.0     # Spring constant
dt = 0.01   # Time step size
num_steps = 1000  # Number of time steps

# Solve the damped oscillator using the signed scalar curvature as forcing function
angles = damped_oscillator_solver(x0, v0, m, c, k, lambda x: signed_curvature(P0, P1, P2, P3, x), dt, num_steps)

# Plot the results
fig, axs = plt.subplots(3, 1, figsize=(10, 12))

# Plot the Bézier curve
t_values = np.linspace(0, 1, 100)
curve_points = np.array([bezier_point(P0, P1, P2, P3, t) for t in t_values])
axs[0].plot(curve_points[:, 0], curve_points[:, 1], label='Bézier Curve')
axs[0].set_title('Bézier Curve')
axs[0].set_xlabel('X')
axs[0].set_ylabel('Y')

# Plot the signed curvature
t_values = np.linspace(0, 1, 100)
curvature_values = [signed_curvature(P0, P1, P2, P3, t) for t in t_values]
axs[1].plot(t_values, curvature_values)
axs[1].set_title('Signed Curvature')
axs[1].set_xlabel('Parameter t')
axs[1].set_ylabel('Signed Curvature')

# Plot the damped oscillator results
axs[2].plot(angles)
axs[2].set_title('Angle of Vector Relative to Tangent Vector')
axs[2].set_xlabel('Time Step')
axs[2].set_ylabel('Angle (Radians)')

plt.tight_layout()
plt.show()
