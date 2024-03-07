# Spline based drifting prototype.
# (This is working pretty good.)

import numpy as np
import matplotlib.pyplot as plt

# Define functions for cubic Bézier curve and its derivatives
def bezier_point(P0, P1, P2, P3, t):
    return (1-t)**3*P0 + 3*(1-t)**2*t*P1 + 3*(1-t)*t**2*P2 + t**3*P3

def bezier_derivative(P0, P1, P2, P3, t):
    return 3*(1-t)**2*(P1 - P0) + 6*(1-t)*t*(P2 - P1) + 3*t**2*(P3 - P2)

def bezier_second_derivative(P0, P1, P2, P3, t):
    return 6*(1-t)*(P2 - 2*P1 + P0) + 6*t*(P3 - 2*P2 + P1)

# Define functions to compute the tangent vector and the signed curvature
def tangent_vector(P0, P1, P2, P3, t):
    dT_dt = bezier_derivative(P0, P1, P2, P3, t)
    return dT_dt / np.linalg.norm(dT_dt)

def signed_curvature(P0, P1, P2, P3, t):
    dT_dt = bezier_derivative(P0, P1, P2, P3, t)
    ddT_dt2 = bezier_second_derivative(P0, P1, P2, P3, t)
    curvature = (dT_dt[0] * ddT_dt2[1] - dT_dt[1] * ddT_dt2[0]) / \
                (np.linalg.norm(dT_dt) ** 3)
    return np.sign(curvature) * np.abs(curvature)

# Define function to rotate vector by an angle
def rotate_vector(vector, angle):
    angle = angle ** 3
    if angle > 3.1415/2:
        angle = 3.1415/2
    if angle < -3.1415/2:
        angle = -3.1415/2

    rotation_matrix = np.array([[np.cos(angle), -np.sin(angle)],
                                [np.sin(angle), np.cos(angle)]])
    return np.dot(rotation_matrix, vector)

# Parameters for cubic spline
P0 = np.array([1.0, 2.0])
P1 = np.array([0.0, 0.0])
P2 = np.array([2.0, -2.0])
P3 = np.array([3.0, 0.0])

# Sample points on the spline
t_values = np.linspace(0, 1, 100)
curve_points = np.array([bezier_point(P0, P1, P2, P3, t) for t in t_values])

# Compute tangent vectors and signed curvatures
tangent_vectors = np.array([tangent_vector(P0, P1, P2, P3, t) for t in t_values])
signed_curvatures = np.array([signed_curvature(P0, P1, P2, P3, t) for t in t_values])

# Rotate tangent vectors by a factor proportional to signed curvature
rotated_tangent_vectors = np.array([rotate_vector(tangent_vectors[i], signed_curvatures[i]) for i in range(len(t_values))])

# Plot the cubic spline and rotated tangent vectors
plt.figure(figsize=(8, 6))
plt.plot(curve_points[:, 0], curve_points[:, 1], label='Cubic Spline')
plt.quiver(curve_points[:, 0], curve_points[:, 1], rotated_tangent_vectors[:, 0], rotated_tangent_vectors[:, 1], color='r', scale=15, label="Rotated Tangent Vectors")
plt.xlabel('X')
plt.ylabel('Y')
plt.title('Cubic Spline with Rotated Tangent Vectors')
plt.legend()
plt.axis('equal')
plt.show()
