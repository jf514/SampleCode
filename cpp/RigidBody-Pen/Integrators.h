#pragma once 

#include <stddef.h>

//////////////////////////////////////////////////////////
// Integrators.
// Descr: Functions for computing update for DynamicEntities
//////////////////////////////////////////////////////////

namespace Integrators{

template<typename DynamicEntity>
void EulerStep(DynamicEntity& inOutDynEntity, double deltaT)
{
	typename DynamicEntity::State currDerivs = inOutDynEntity.CalcDerivs();

	for (size_t idx = 0; idx < currDerivs.size(); ++idx)
	{
		inOutDynEntity.m_State[idx] += deltaT * currDerivs[idx];
	}
}

template<typename DynamicEntity>
void MidPointStep(DynamicEntity& inOutDynEntity, double deltaT)
{
	DynamicEntity midDynEntity = inOutDynEntity;
	EulerStep(midDynEntity, 0.5 * deltaT);

	typename DynamicEntity::State midDerivs = midDynEntity.CalcDerivs();
    
	for (size_t idx = 0; idx < midDerivs.size(); ++idx)
	{
		inOutDynEntity.m_State[idx] += deltaT * midDerivs[idx];
	}
}

} // Integrators