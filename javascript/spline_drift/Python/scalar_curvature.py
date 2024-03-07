import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumtrapz
from scipy.interpolate import interp1d

def bezier_point(P0, P1, P2, P3, t):
    """Calculate a point on a cubic Bézier curve."""
    return (1-t)**3*P0 + 3*(1-t)**2*t*P1 + 3*(1-t)*t**2*P2 + t**3*P3

def bezier_derivative(P0, P1, P2, P3, t, order=1):
    """
    Calculate the derivative of a cubic Bézier curve.

    Parameters:
        P0, P1, P2, P3 (ndarray): Control points of the Bézier curve.
        t (float): Parameter value.
        order (int): Order of the derivative (1 for first derivative, 2 for second derivative).

    Returns:
        ndarray: Derivative vector.
    """
    if order == 1:
        return 3*(1-t)**2*(P1 - P0) + 6*(1-t)*t*(P2 - P1) + 3*t**2*(P3 - P2)
    elif order == 2:
        return 6*(1-t)*(P2 - 2*P1 + P0) + 6*t*(P3 - 2*P2 + P1)
    else:
        raise ValueError("Order must be 1 or 2.")

def create_arc_length_lookup_table(P0, P1, P2, P3, num_points=1000):
    """Precompute a lookup table for mapping t to arc length."""
    t_values = np.linspace(0, 1, num_points)
    points = np.array([bezier_derivative(P0, P1, P2, P3, t) for t in t_values])
    arc_lengths = cumtrapz(np.linalg.norm(points, axis=1), t_values, initial=0)
    return t_values, arc_lengths

def arc_length_parameterized_bezier_with_curvature(P0, P1, P2, P3, num_samples=100):
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
    tangent_vectors /= np.linalg.norm(tangent_vectors, axis=1)[:, None]
    
    # Compute curvature as a vector field at these t values
    dT_dt = np.array([bezier_derivative(P0, P1, P2, P3, t) for t in uniform_t_values])
    ddT_dt2 = np.array([bezier_derivative(P0, P1, P2, P3, t, order=2) for t in uniform_t_values])
    curvature_vector = (dT_dt[:, 0] * ddT_dt2[:, 1] - dT_dt[:, 1] * ddT_dt2[:, 0]) / \
                       (np.linalg.norm(dT_dt, axis=1) ** 3)
    
    # Reshape curvature vector to be 2D
    curvature_vector = curvature_vector[:, None]  # Add new axis
    
    # Compute curvature as a scalar field at these t values
    curvature_scalar = np.abs(curvature_vector)
    
    return curve_points, tangent_vectors, curvature_vector, curvature_scalar, uniform_arc_lengths

# Example control points
P0 = np.array([0.0, 0.0])
P1 = np.array([1.0, 2.0])
P2 = np.array([2.0, -1.0])
P3 = np.array([3.0, 0.0])

# Compute arc-length parameterized points, tangent vectors, curvature vector, curvature scalar, and arc lengths
curve_points, tangent_vectors, curvature_vector, curvature_scalar, arc_lengths = arc_length_parameterized_bezier_with_curvature(P0, P1, P2, P3, 100)

# Plotting the curve and curvature
plt.figure(figsize=(12, 6))

# Plot the Bézier curve
plt.plot(curve_points[:, 0], curve_points[:, 1], label="Bézier Curve")

# Plot the curvature as a scalar field
plt.scatter(curve_points[:, 0], curve_points[:, 1], c=curvature_scalar, cmap='viridis', label="Scalar Curvature")
plt.colorbar(label='Scalar Curvature')

# Plot the curvature vectors
plt.quiver(curve_points[:, 0], curve_points[:, 1], curvature_vector[:, 0], curvature_vector[:, 1], color='r', scale=15, label="Curvature Vectors")

plt.title('Bézier Curve with Curvature')
plt.xlabel('X')
plt.ylabel('Y')
plt.legend()
plt.grid(True)
plt.axis('equal')
plt.show()
