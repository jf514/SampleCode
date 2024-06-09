#include "./Integrators.h"

#include <assert.h>
#include <iostream>

//////////////////////////////////////////////////////////
// Simulation main class.
// Descr:
//////////////////////////////////////////////////////////

template <typename DynamicEntityType>
class Simulation
{
public:

    // Simulation output for now is just final state. Redefine 
    // if something more sophisticated is required later, eg .bag
    // file or other.
    using SimulationOutputType = typename DynamicEntityType::State;

    Simulation(double duration, double deltaT, bool printStatus, DynamicEntityType dynEntity)
    : m_Duration(duration)
    , m_DeltaT(deltaT)
    , m_PrintStatus(printStatus)
    , m_DynEntity(dynEntity)
    {}

    bool Run()
    {
        // Check simulation input is self consistent
        if( m_DeltaT <= 0.0 || m_DeltaT >= m_Duration )
        {
            std::cout << "Simulation Failed! Preconditions not met. \n";
            return false;
        }
        else
        {
            // Track the simulation time
            double elapsedTime = 0.0; 

            if(m_PrintStatus)
            {
                PrintStatus(elapsedTime);
            }

            while(elapsedTime < m_Duration)
            {
                // Update
                Integrators::MidPointStep(m_DynEntity, m_DeltaT);
                elapsedTime += m_DeltaT;    

                // Visualize -- stdout for now, but could be something more sophisticated
                // upate graphics, etc..
                if(m_PrintStatus)
                {
                    PrintStatus(elapsedTime); 
                }
            }

            return true;
        }
    }

    // This is sort of a dummy implementatoin of getting the
    // final simulation output. 
    SimulationOutputType GetOutput() const
    {
        return m_DynEntity.m_State;
    }

private:

    // Writes output to stdout
    void PrintStatus(double currTime)
    {
        const std::string dynState = m_DynEntity.ReportState();
        std::cout << "****************************************\n";
        std::cout << "t = " << currTime << ", \n " << dynState << "\n";   
    }

private:
    const double m_Duration;        // in seconds.
    const double m_DeltaT;          // in seconds.
    const bool m_PrintStatus;
    DynamicEntityType m_DynEntity;  // Must conform to DynamicEntity interface 
                                    // as described in DynamicEntity.cpp 
};