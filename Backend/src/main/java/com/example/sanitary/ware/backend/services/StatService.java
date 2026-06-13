package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.entities.Stat;
import com.example.sanitary.ware.backend.repositories.StatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatService {

    private final StatRepository statRepository;

    public List<Stat> getAllStats() {
        return statRepository.findAll();
    }

    public Stat getStatById(Long id) {
        return statRepository.findById(id).orElseThrow(() -> new RuntimeException("Stat not found with id " + id));
    }

    public Stat createStat(Stat stat) {
        return statRepository.save(stat);
    }

    public Stat updateStat(Long id, Stat statDetails) {
        Stat existingStat = getStatById(id);
        existingStat.setLabel(statDetails.getLabel());
        existingStat.setValue(statDetails.getValue());
        existingStat.setIcon(statDetails.getIcon());
        existingStat.setIconColor(statDetails.getIconColor());
        return statRepository.save(existingStat);
    }

    public void deleteStat(Long id) {
        statRepository.deleteById(id);
    }
}
