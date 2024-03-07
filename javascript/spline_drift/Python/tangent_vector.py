# This one works 


import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumtrapz
from scipy.interpolate import interp1d

def bezier_point(P0, P1, P2, P3, t):
    """Calculate a point on a cubic Bézier curve."""
    return (1-t)**3*P0 + 3*(1-t)**2*t*P1 + 3*(1-t)*t**2*P2 + t**3*P3

def bezier_derivative(P0, P1, P2, P3, t):
    """Calculate the first derivative (tangent vector) of a cubic Bézier curve."""
    return 3*(1-t)**2*(P1 - P0) + 6*(1-t)*t*(P2 - P1) + 3*t**2*(P3 - P2)

def create_arc_length_lookup_table(P0, P1, P2, P3, num_points=1000):
    """Precompute a lookup table for mapping t to arc length."""
    t_values = np.linspace(0, 1, num_points)
    points = np.array([bezier_derivative(P0, P1, P2, P3, t) for t in t_values])
    arc_lengths = cumtrapz(np.linalg.norm(points, axis=1), t_values, initial=0)
    return t_values, arc_lengths

def arc_length_parameterized_bezier(P0, P1, P2, P3, num_samples=100):
    """Sample the Bézier curve at equal intervals of arc length using the precomputed table."""
    t_values, arc_lengths = create_arc_length_lookup_table(P0, P1, P2, P3, 1000)
    total_length = arc_lengths[-1]
    uniform_arc_lengths = np.linspace(0, total_length, num_samples)
    
    # Interpolate to find t values corresponding to uniform arc lengths
    t_from_arc_length = interp1d(arc_lengths, t_values)
    uniform_t_values = t_from_arc_length(uniform_arc_lengths)
    
    # Compute points on the curve at these t values
    curve_points = np.array([bezier_point(P0, P1, P2, P3, t) for t in uniform_t_values])
    
    # Compute tangent vectors at these t values and normalize them
    tangent_vectors = np.array([bezier_derivative(P0, P1, P2, P3, t) for t in uniform_t_values])
    #tangent_vectors /= np.linalg.norm(tangent_vectors, axis=1)[:, None]
    
    # Calculate angles of tangent vectors with the x-axis
    angles = np.arctan2(tangent_vectors[:, 1], tangent_vectors[:, 0]) * 180 / np.pi
    
    # Downsample tangent vectors to 1/5 of the number of points
    curve_points = curve_points[::5]
    tangent_vectors = tangent_vectors[::5]
    angles = angles[::5]
    
    return curve_points, tangent_vectors, angles


def rotate_tangent_vectors(tangent_vectors, angles):
    """
    Rotate each tangent vector by the corresponding angle.
    
    Parameters:
        tangent_vectors (ndarray): Array of shape (N, 2) representing 2D tangent vectors.
        angles (ndarray): Array of angles in radians.
        
    Returns:
        ndarray: Rotated tangent vectors.
    """
    rotated_tangent_vectors = np.zeros_like(tangent_vectors)
    
    for i, angle in enumerate(angles):
        # Rotation matrix for 2D vectors
        rotation_matrix = np.array([[np.cos(angle), -np.sin(angle)],
                                    [np.sin(angle), np.cos(angle)]])
        
        # Rotate the tangent vector using the rotation matrix
        rotated_tangent_vectors[i] = np.dot(rotation_matrix, tangent_vectors[i])
    
    return rotated_tangent_vectors

# Example control points
P0 = np.array([0.0, 0.0])
P1 = np.array([1.0, 2.0])
P2 = np.array([2.0, -1.0])
P3 = np.array([3.0, 0.0])

# Compute arc-length parameterized points, tangent vectors, and angles
curve_points, tangent_vectors, angles = arc_length_parameterized_bezier(P0, P1, P2, P3, 100)

pi_2 = (3.1415926/2)*np.ones_like(angles)
tangent_vectors = rotate_tangent_vectors(tangent_vectors, pi_2)

# Plotting the curve, tangent vectors, and angles
plt.figure(figsize=(8, 6))
plt.plot(curve_points[:, 0], curve_points[:, 1], label="Arc-Length Parameterized Curve")
plt.quiver(curve_points[:, 0], curve_points[:, 1], tangent_vectors[:, 0], tangent_vectors[:, 1], angles='xy', color='r', scale=30, label="Tangent Vectors")
plt.plot([P0[0], P1[0], P2[0], P3[0]], [P0[1], P1[1], P2[1], P3[1]], 'ro--', label="Control Points")
plt.title("Arc-Length Parameterized Cubic Bézier Curve with Tangent Vectors")
plt.legend()
plt.xlabel("X")
plt.ylabel("Y")
plt.grid(True)

# Set equal aspect ratio
plt.axis('equal')

plt.show()
