# Spline Drifting Project

This project demonstrates a very simple model for ["drifting"](https://en.wikipedia.org/wiki/Drifting_(motorsport)#:~:text=Drifting%20is%20a%20driving%20technique,a%20corner%20or%20a%20turn) in motorsports. This is essentially controlled oversteer of a vehicle, with the intent of taking tighter corners at higher velocities than normal Ackerman steering would allow. I'm calling it Spline Drifting, because it uses splines for the trajectory, and then uses the curvature of the spline to calcualte the drift angle. Simple! So simple, in fact, that it must have been thought up before, though I've never seen it anywhere else. [^1]

The concept consists of two parts:

1) We use a spline to represent the path of the vehicle.
2) We calculate the signed, scalar spline [curvature](https://en.wikipedia.org/wiki/Curvature), and set the drift angle proportional to curvature. (We limit it by a maximum, so as not to exceed a threshold.)
3) We calcule the orientation of the vehicle by calculating the tangent direction, and then rotating by the angle determined in 2).

That's it!

[^1]: It's most useful for NPC/non-ego agents in simulations where you either don't have access to a physics engine, or don't want to use it for whatever reason.

## How to run

1. Make sure three.js is installed as https://threejs.org/docs/#manual/en/introduction/Installation (Option 2)

2. Run "npx serve ." from this directory

3. Click on either link to open a browser