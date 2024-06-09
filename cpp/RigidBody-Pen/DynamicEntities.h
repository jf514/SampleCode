# pragma once

#include <array>
#include <ostream>

//////////////////////////////////////////////////////////
// DynamicEntities
// Descr: Different entities which may be used with 
// Simulation
//////////////////////////////////////////////////////////

// Represents particle moving with a constant velocity.
class ConstantVelParticle
{
public:
    using State = std::array<double, 2>;

    ConstantVelParticle(const State& initialState)
    : m_State(initialState)
    {}

    State CalcDerivs() const
    {
        return State{ m_State[1], 0.0};
    }

    const std::string ReportState() const
    {
        std::string out = 
            "CVP: x = " + 
            std::to_string(m_State[0]) + 
            ", vel_x = " +
            std::to_string(m_State[1]) + "\n";

        return out;
    }

    State m_State; 
};

// Simple harmonic motion.
class SimpleSpringMotion
{
public:
    using State = std::array<double, 2>;

    SimpleSpringMotion(const State& initialState, double kOverM)
    : m_State(initialState), m_KOverM(kOverM)
    {}

    State CalcDerivs() const
    {
        return State{ m_State[1], -m_KOverM*m_State[0]};
    }

    const std::string ReportState() const
    {
       std::string out = 
            "SHO: x = " + 
            std::to_string(m_State[0]) + 
            ", vel_x = " +
            std::to_string(m_State[1]) + "\n";

        return out;
    }

    State m_State;

private:
    double m_KOverM;
};

// Pen class implementation. Encapsulates dynamics of a spinning pen,
// crudely, as name suggests. Dynamics are that of a freely spinning 
// rigid body under gravity only. All other forces are neglected.  
// Rotational motion described by Euler's equations. Clients specify 
// intertia tensor as a diagonal in principle axis frame. Angular rotations 
// are represented by Tait Bryan angles.
class CrudeSpinningPen
{
public:
   using State = std::array<double, 12>;

    CrudeSpinningPen(const State initialState, const std::array<double, 3> inertiaTensor)
        : m_State(initialState)
        , m_Inertia(inertiaTensor)
        {}

    State CalcDerivs() const
    {
        State derivs;

        // Initialize derivatives which are just velocities
        // Eg, dx/dt = V_x, and so on.
        for(uint8_t i = 0; i < 6; ++i)
        {
            derivs[i] = m_State[i+6];
        }

        // Derivatives of center of mass coords.
        // Accel in x, y dirs of cm is zero, 
        // in z dir it's gravity. Eg, dVz/dt = -g
        derivs[6] = 0;      // m/s/s
        derivs[7] = 0;      // m/s/s
        derivs[8] = -9.8;   // m/s/s - acceleration due to gravity

        // Derivatives of angular cooords, corresponding
        // to rigid body motion - these are Euler's equations
        // of Rigid body dynamics - see 
        // https://en.wikipedia.org/wiki/Euler%27s_equations_(rigid_body_dynamics)
        derivs[9] = m_State[10]*m_State[11]*(m_Inertia[1] - m_Inertia[2])/m_Inertia[0]; 
        derivs[10] = m_State[11]*m_State[9]*(m_Inertia[2] - m_Inertia[0])/m_Inertia[1];
        derivs[11] = m_State[9]*m_State[10]*(m_Inertia[0] - m_Inertia[1])/m_Inertia[2];

        return derivs;
    }

    const std::string ReportState() const
    {
       std::string out = 
            "CSP: x = " + 
            std::to_string(m_State[0]) + 
            ", y = " + 
            std::to_string(m_State[1]) + 
            ", z = " + 
            std::to_string(m_State[2]) + 
            ",\n theta = " + 
            std::to_string(m_State[3]) + 
            ", phi = " + 
            std::to_string(m_State[4]) + 
            ", psi = " + 
            std::to_string(m_State[5]) + 
            ",\n vel_x = " +
            std::to_string(m_State[6]) +
            ", vel_y = " +
            std::to_string(m_State[7]) + 
            ", vel_z = " +
            std::to_string(m_State[8]) + 
            ",\n theta_dot = " +
            std::to_string(m_State[9]) +
            ", phi_dot = " +
            std::to_string(m_State[10]) + 
            ", psi_dot = " +
            std::to_string(m_State[11]) + "\n";

        return out;
    }

    State m_State;

private:
    std::array<double, 3> m_Inertia;
};