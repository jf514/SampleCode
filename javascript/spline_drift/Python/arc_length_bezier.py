import numpy as np
from scipy.integrate import cumtrapz
from scipy.interpolate import interp1d
import matplotlib.pyplot as plt

def bezier_point(P0, P1, P2, P3, t):
    """Calculate a point on a cubic Bézier curve."""
    return (1-t)**3*P0 + 3*(1-t)**2*t*P1 + 3*(1-t)*t**2*P2 + t**3*P3

def bezier_derivative(P0, P1, P2, P3, t):
    """Calculate the first derivative (velocity vector) of a cubic Bézier curve."""
    return -3*(1-t)**2*P0 + 3*(1-3*t+2*t**2)*P1 + 3*(-t+2*t**2)*P2 + 3*t**2*P3

def generate_arc_length_table(P0, P1, P2, P3, num_points=1000):
    """Generate a table of arc lengths and corresponding t values for the curve."""
    t_values = np.linspace(0, 1, num_points)
    derivatives = np.array([bezier_derivative(P0, P1, P2, P3, t) for t in t_values])
    speeds = np.linalg.norm(derivatives, axis=1)
    arc_lengths = cumtrapz(speeds, t_values, initial=0)
    total_length = arc_lengths[-1]
    return t_values, arc_lengths, total_length

def arc_length_parameterization(P0, P1, P2, P3, num_samples=100):
    """Sample the Bézier curve at equal intervals of arc length using a precomputed table."""
    t_values, arc_lengths, total_length = generate_arc_length_table(P0, P1, P2, P3)
    s_values = np.linspace(0, total_length, num_samples)
    t_from_s = interp1d(arc_lengths, t_values)
    sampled_t_values = t_from_s(s_values)
    points = np.array([bezier_point(P0, P1, P2, P3, t) for t in sampled_t_values])
    return points

# Example control points
P0 = np.array([0.0, 0.0])
P1 = np.array([1.0, 2.0])
P2 = np.array([2.0, -1.0])
P3 = np.array([3.0, 0.0])

# Compute arc-length parameterized points
arc_length_points = arc_length_parameterization(P0, P1, P2, P3, num_samples=100)

# Visualization
plt.figure()
plt.plot(arc_length_points[:, 0], arc_length_points[:, 1], label="Arc-Length Parameterized Curve", marker='o', markersize=2)
plt.plot([P0[0], P1[0], P2[0], P3[0]], [P0[1], P1[1], P2[1], P3[1]], 'ro--', label="Control Points")
plt.legend()
plt.title("Arc-Length Parameterized Cubic Bézier Curve")
plt.xlabel("x")
plt.ylabel("y")
plt.grid(True)
plt.show()
