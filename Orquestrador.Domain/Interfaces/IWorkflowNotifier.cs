using Orquestrador.Domain.Models;

namespace Orquestrador.Domain.Interfaces;

public interface IWorkflowNotifier
{
    Task NotifyStepAsync(WorkflowStep step);
}
